package com.sentinel.common.constants;

public final class EventTypes {
    public static final String REQUEST_RECEIVED = "REQUEST_RECEIVED";
    public static final String AUTH_FAILED = "AUTH_FAILED";
    public static final String RISK_FLAGGED = "RISK_FLAGGED";
    public static final String POLICY_ALLOWED = "POLICY_ALLOWED";
    public static final String POLICY_DENIED = "POLICY_DENIED";
    public static final String POLICY_NO_MATCH = "POLICY_NO_MATCH";
    public static final String REQUEST_FORWARDED = "REQUEST_FORWARDED";
    public static final String GATEWAY_ERROR = "GATEWAY_ERROR";
    
    private EventTypes() {}
}
