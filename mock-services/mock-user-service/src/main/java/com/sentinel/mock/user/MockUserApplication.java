package com.sentinel.mock.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api/users")
public class MockUserApplication {

    public static void main(String[] args) {
        SpringApplication.run(MockUserApplication.class, args);
    }

    @GetMapping("/profile")
    public Map<String, Object> getProfile() {
        return Map.of("id", "USR-123", "name", "John Doe", "email", "john@example.com");
    }
}
