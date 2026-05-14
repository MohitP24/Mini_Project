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
@Table(name = "sessions_summary")
public class SessionSummary {
    @Id
    private UUID sessionId;
    
    private Long firstSeenNs;
    private Long lastSeenNs;
    private Integer eventCount;
    private Float maxRiskScore;
    private Integer denyCount;
    private String userId;
    private Boolean flagged;
    
    @Column(columnDefinition = "jsonb")
    private String endpointsAccessed;
    
    private OffsetDateTime updatedAt;
}
