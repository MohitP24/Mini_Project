package com.sentinel.common.dto;

import lombok.Data;
import java.util.UUID;
import java.time.OffsetDateTime;

@Data
public class EventDTO {
    private UUID eventId;
    private Long timestampNs;
    private String eventType;
    private UUID sessionId;
    private String userId;
    private Object roles;
    private String endpoint;
    private String httpMethod;
    private String sourceIp;
    private String userAgent;
    private String policyRuleId;
    private Integer policyRuleVersion;
    private UUID policyRuleSnapshotId;
    private Float riskScore;
    private Object riskSignals;
    private String decision;
    private Object requestContext;
    private String bodyHash;
    private String eventHash;
    private String gatewayVersion;
    private OffsetDateTime createdAt;
}
