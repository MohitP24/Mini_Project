package com.sentinel.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.sentinel.common.entity")
public class SentinelAdminApplication {
    public static void main(String[] args) {
        SpringApplication.run(SentinelAdminApplication.class, args);
    }
}
