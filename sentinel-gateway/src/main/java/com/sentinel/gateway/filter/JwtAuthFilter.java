package com.sentinel.gateway.filter;

import com.sentinel.common.constants.Headers;
import com.sentinel.common.model.JwtClaims;
import com.sentinel.gateway.security.JwtValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    public static final String JWT_CLAIMS_ATTR = "jwtClaims";
    
    private final JwtValidator jwtValidator;
    
    @Value("${sentinel.gateway.public-endpoints}")
    private String publicEndpointsConfig;
    
    private List<String> publicEndpoints;

    public JwtAuthFilter(JwtValidator jwtValidator) {
        this.jwtValidator = jwtValidator;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (publicEndpoints == null) {
            publicEndpoints = Arrays.asList(publicEndpointsConfig.split(","));
        }

        String path = exchange.getRequest().getURI().getPath();
        boolean isPublic = publicEndpoints.stream().anyMatch(path::startsWith);

        if (isPublic) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(Headers.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);
        JwtClaims claims = jwtValidator.validateAndExtract(token);

        if (claims == null) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        exchange.getAttributes().put(JWT_CLAIMS_ATTR, claims);
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -80; // Run after SessionAssign
    }
}
