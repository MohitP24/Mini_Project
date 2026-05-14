package com.sentinel.gateway.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.common.constants.EventTypes;
import com.sentinel.common.entity.EventRecord;
import com.sentinel.common.model.Decision;
import com.sentinel.common.model.RequestContext;
import com.sentinel.gateway.policy.RiskScorer;
import com.sentinel.gateway.policy.RuleEvaluator;
import com.sentinel.common.model.JwtClaims;
import com.sentinel.gateway.service.EventFactory;
import com.sentinel.gateway.service.EventWriter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class PolicyEnforcementFilter implements GlobalFilter, Ordered {

    public static final String REQUEST_CONTEXT_ATTR = "requestContext";

    private final RiskScorer riskScorer;
    private final RuleEvaluator ruleEvaluator;
    private final EventFactory eventFactory;
    private final EventWriter eventWriter;
    private final ObjectMapper objectMapper;

    public PolicyEnforcementFilter(RiskScorer riskScorer, RuleEvaluator ruleEvaluator, EventFactory eventFactory, EventWriter eventWriter, ObjectMapper objectMapper) {
        this.riskScorer = riskScorer;
        this.ruleEvaluator = ruleEvaluator;
        this.eventFactory = eventFactory;
        this.eventWriter = eventWriter;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        JwtClaims claims = exchange.getAttribute(JwtAuthFilter.JWT_CLAIMS_ATTR);
        
        RequestContext context = new RequestContext();
        context.setTraceId(exchange.getAttribute(RequestReceiverFilter.TRACE_ID_ATTR));
        context.setSessionId(exchange.getAttribute(SessionAssignFilter.SESSION_ID_ATTR));
        context.setEndpoint(exchange.getRequest().getURI().getPath());
        context.setHttpMethod(exchange.getRequest().getMethod().name());
        context.setSourceIp(exchange.getRequest().getRemoteAddress() != null ? 
                exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() : "0.0.0.0");
        context.setUserAgent(exchange.getRequest().getHeaders().getFirst("User-Agent"));
        context.setJwtClaims(claims);
        
        if (claims != null) {
            context.setRoles(claims.getRoles());
            context.setUserId(claims.getSubject());
        }

        exchange.getAttributes().put(REQUEST_CONTEXT_ATTR, context);

        // 1. Calculate Risk
        riskScorer.calculateAndInjectRisk(context);

        // 2. Evaluate Rules
        RuleEvaluator.EvaluationResult result = ruleEvaluator.evaluate(context);

        // If Denied, log event and block
        if (result.decision() == Decision.DENY) {
            recordEvent(exchange, context, result, EventTypes.POLICY_DENIED);
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // If Allowed, record evaluation and proceed
        recordEvent(exchange, context, result, EventTypes.POLICY_ALLOWED);

        return chain.filter(exchange);
    }

    private void recordEvent(ServerWebExchange exchange, RequestContext context, RuleEvaluator.EvaluationResult result, String eventType) {
        String riskSignalsJson = null;
        if (context.getCalculatedRisk() != null && context.getCalculatedRisk().getSignals() != null) {
            try {
                riskSignalsJson = objectMapper.writeValueAsString(context.getCalculatedRisk().getSignals());
            } catch (JsonProcessingException ignored) {}
        }
        
        String rolesJson = null;
        if (context.getRoles() != null) {
            try {
                rolesJson = objectMapper.writeValueAsString(context.getRoles());
            } catch (JsonProcessingException ignored) {}
        }

        EventRecord event = eventFactory.createEvent(
                eventType,
                context.getSessionId(),
                context.getUserId(),
                rolesJson,
                context.getEndpoint(),
                context.getHttpMethod(),
                context.getSourceIp(),
                context.getUserAgent(),
                result.rule() != null ? result.rule().getRuleId() : null,
                result.rule() != null ? result.rule().getVersion() : null,
                null, // snapshotId not tracked at gateway evaluation phase directly
                context.getCalculatedRisk() != null ? context.getCalculatedRisk().getScore().floatValue() : 0.0f,
                riskSignalsJson,
                result.decision(),
                null, // request context JSON
                null // bodyHash
        );
        eventWriter.writeEvent(event);
    }

    @Override
    public int getOrder() {
        return -70; // After JwtAuthFilter (-80)
    }
}
