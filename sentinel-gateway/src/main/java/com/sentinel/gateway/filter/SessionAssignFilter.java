package com.sentinel.gateway.filter;

import com.sentinel.common.constants.Headers;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class SessionAssignFilter implements GlobalFilter, Ordered {

    public static final String SESSION_ID_ATTR = "sessionId";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String sessionIdStr = exchange.getRequest().getHeaders().getFirst(Headers.X_SESSION_ID);
        UUID sessionId;
        
        if (sessionIdStr != null && !sessionIdStr.isEmpty()) {
            try {
                sessionId = UUID.fromString(sessionIdStr);
            } catch (IllegalArgumentException e) {
                sessionId = UUID.randomUUID();
            }
        } else {
            sessionId = UUID.randomUUID();
        }
        
        exchange.getAttributes().put(SESSION_ID_ATTR, sessionId);

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header(Headers.X_SESSION_ID, sessionId.toString())
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return -90; // Run after RequestReceiver
    }
}
