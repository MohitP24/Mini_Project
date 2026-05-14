package com.sentinel.mock.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api/payments")
public class MockPaymentApplication {

    public static void main(String[] args) {
        SpringApplication.run(MockPaymentApplication.class, args);
    }

    @PostMapping("/process")
    public Map<String, Object> processPayment() {
        return Map.of("status", "SUCCESS", "transactionId", "TXN-" + System.currentTimeMillis());
    }

    @GetMapping("/history")
    public Map<String, Object> getHistory() {
        return Map.of("transactions", "[]");
    }
}
