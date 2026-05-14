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
@Table(name = "policy_rules_history")
public class PolicyRuleHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID snapshotId;
    
    private String ruleId;
    private Integer version;
    
    @Column(columnDefinition = "jsonb")
    private String fullConditions;
    
    private String decision;
    private OffsetDateTime activatedAt;
    private String activatedBy;
    private OffsetDateTime deactivatedAt;
}
