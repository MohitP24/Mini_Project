package com.sentinel.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "events")
public class EventRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID eventId;
    
    private Long timestampNs;
    private String eventType;
    private UUID sessionId;
    private String userId;
    
    @Column(columnDefinition = "jsonb")
    private String roles;
    
    private String endpoint;
    private String httpMethod;
    @Column(columnDefinition = "inet")
    private String sourceIp;
    private String userAgent;
    private String policyRuleId;
    private Integer policyRuleVersion;
    private UUID policyRuleSnapshotId;
    private Float riskScore;
    
    @Column(columnDefinition = "jsonb")
    private String riskSignals;
    
    private String decision;
    
    @Column(columnDefinition = "jsonb")
    private String requestContext;
    
    private String bodyHash;
    private String eventHash;
    private String gatewayVersion;
    private OffsetDateTime createdAt;
}
