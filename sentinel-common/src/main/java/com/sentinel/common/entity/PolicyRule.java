package com.sentinel.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "policy_rules")
public class PolicyRule {
    @Id
    private String ruleId;
    private Integer version;
    @Transient
    private UUID snapshotId;
    private String name;
    private String description;
    
    @Column(columnDefinition = "jsonb")
    private String conditions;
    
    private String decision;
    private Integer priority;
    private Boolean active;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String createdBy;
}
