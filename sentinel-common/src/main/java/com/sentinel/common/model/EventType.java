package com.sentinel.common.model;

public enum EventType {
    REQUEST_RECEIVED,
    AUTH_FAILED,
    RISK_FLAGGED,
    POLICY_ALLOWED,
    POLICY_DENIED,
    POLICY_NO_MATCH,
    REQUEST_FORWARDED,
    GATEWAY_ERROR
}
