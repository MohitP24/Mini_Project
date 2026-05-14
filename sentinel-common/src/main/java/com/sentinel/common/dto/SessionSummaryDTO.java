package com.sentinel.common.dto;

import lombok.Data;
import java.util.UUID;
import java.time.OffsetDateTime;

@Data
public class SessionSummaryDTO {
    private UUID sessionId;
    private Long firstSeenNs;
    private Long lastSeenNs;
    private Integer eventCount;
    private Float maxRiskScore;
    private Integer denyCount;
    private String userId;
    private Boolean flagged;
    private Object endpointsAccessed;
    private OffsetDateTime updatedAt;
}
