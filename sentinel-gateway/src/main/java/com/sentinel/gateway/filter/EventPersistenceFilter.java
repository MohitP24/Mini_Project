package com.sentinel.gateway.filter;

import com.sentinel.common.constants.EventTypes;
import com.sentinel.common.entity.EventRecord;
import com.sentinel.gateway.service.EventFactory;
import com.sentinel.gateway.service.EventWriter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class EventPersistenceFilter implements GlobalFilter, Ordered {

    private final EventFactory eventFactory;
    private final EventWriter eventWriter;

    public EventPersistenceFilter(EventFactory eventFactory, EventWriter eventWriter) {
        this.eventFactory = eventFactory;
        this.eventWriter = eventWriter;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            UUID sessionId = exchange.getAttribute(SessionAssignFilter.SESSION_ID_ATTR);
            if (sessionId == null) sessionId = UUID.randomUUID();

            String endpoint = exchange.getRequest().getURI().getPath();
            String method = exchange.getRequest().getMethod().name();
            String sourceIp = exchange.getRequest().getRemoteAddress() != null ? 
                    exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() : "0.0.0.0";
            String userAgent = exchange.getRequest().getHeaders().getFirst("User-Agent");

            // Build an event and write it
            EventRecord event = eventFactory.createEvent(
                    EventTypes.REQUEST_FORWARDED,
                    sessionId,
                    null, // userId
                    null, // roles
                    endpoint,
                    method,
                    sourceIp,
                    userAgent,
                    null, // policyRuleId
                    null, // policyRuleVersion
                    null, // snapshotId
                    null, // riskScore
                    null, // riskSignals
                    null, // decision
                    null, // requestContext
                    null  // bodyHash
            );
            
            eventWriter.writeEvent(event);
        }));
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE; // Run last on the way out
    }
}
