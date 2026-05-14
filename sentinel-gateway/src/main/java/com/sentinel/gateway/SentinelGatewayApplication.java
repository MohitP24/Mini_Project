package com.sentinel.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.sentinel.common.entity")
public class SentinelGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(SentinelGatewayApplication.class, args);
    }
}
