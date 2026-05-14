package com.sentinel.common.dto;

import lombok.Data;
import java.util.UUID;
import java.time.OffsetDateTime;

@Data
public class PolicySnapshotDTO {
    private UUID snapshotId;
    private String ruleId;
    private Integer version;
    private Object fullConditions;
    private String decision;
    private OffsetDateTime activatedAt;
    private String activatedBy;
    private OffsetDateTime deactivatedAt;
}
