package com.sentinel.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestContext {
    private String userId;
    private List<String> roles;
    private JwtClaims jwtClaims;
    private String endpoint;
    private String httpMethod;
    private String sourceIp;
    private String userAgent;
    private UUID sessionId;
    private Double riskScore;
    private RiskScore calculatedRisk;
    private String bodyHash;
    private UUID traceId;
}
