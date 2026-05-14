package com.sentinel.forensics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.sentinel.common.entity")
public class SentinelForensicsApplication {
    public static void main(String[] args) {
        SpringApplication.run(SentinelForensicsApplication.class, args);
    }
}
