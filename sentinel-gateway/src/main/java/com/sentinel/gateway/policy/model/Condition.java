package com.sentinel.gateway.policy.model;

import lombok.Data;

@Data
public class Condition {
    private String type; // e.g., "ip", "risk", "role", "endpoint"
    private Operator operator;
    private Object value;
}
