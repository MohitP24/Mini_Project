package com.sentinel.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyDecision {
    private Decision decision;
    private String ruleId;
    private Integer ruleVersion;
    private UUID snapshotId;
}
