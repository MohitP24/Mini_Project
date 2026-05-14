package com.sentinel.mock.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api/admin")
public class MockAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(MockAdminApplication.class, args);
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardData() {
        return Map.of("activeUsers", 42, "alerts", 0);
    }
}
