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
public class RequestReceiverFilter implements GlobalFilter, Ordered {

    public static final String TRACE_ID_ATTR = "traceId";
    public static final String START_TIME_ATTR = "startTimeNs";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis() * 1_000_000L + (System.nanoTime() % 1_000_000L);
        exchange.getAttributes().put(START_TIME_ATTR, startTime);

        String traceId = exchange.getRequest().getHeaders().getFirst(Headers.X_TRACE_ID);
        if (traceId == null || traceId.isEmpty()) {
            traceId = UUID.randomUUID().toString();
        }
        exchange.getAttributes().put(TRACE_ID_ATTR, traceId);

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header(Headers.X_TRACE_ID, traceId)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return -100; // Run very early
    }
}
