package com.sentinel.common.util;

import com.sentinel.common.entity.EventRecord;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

public class EventHashUtil {
    
    public static String computeHash(EventRecord event) {
        StringBuilder sb = new StringBuilder();
        sb.append("event_id=").append(nullSafe(event.getEventId())).append("|");
        sb.append("timestamp_ns=").append(nullSafe(event.getTimestampNs())).append("|");
        sb.append("event_type=").append(nullSafe(event.getEventType())).append("|");
        sb.append("session_id=").append(nullSafe(event.getSessionId())).append("|");
        sb.append("user_id=").append(nullSafe(event.getUserId())).append("|");
        sb.append("endpoint=").append(nullSafe(event.getEndpoint())).append("|");
        sb.append("http_method=").append(nullSafe(event.getHttpMethod())).append("|");
        sb.append("decision=").append(nullSafe(event.getDecision())).append("|");
        sb.append("policy_rule_id=").append(nullSafe(event.getPolicyRuleId())).append("|");
        sb.append("policy_rule_version=").append(nullSafe(event.getPolicyRuleVersion())).append("|");
        
        String riskStr = "null";
        if (event.getRiskScore() != null) {
            riskStr = String.format("%.6f", event.getRiskScore());
        }
        sb.append("risk_score=").append(riskStr).append("|");
        sb.append("body_hash=").append(nullSafe(event.getBodyHash())).append("|");
        sb.append("gateway_version=").append(nullSafe(event.getGatewayVersion())).append("|");
        
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(sb.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error computing SHA-256 hash", e);
        }
    }
    
    private static String nullSafe(Object obj) {
        if (obj == null) return "null";
        return obj.toString();
    }
}
