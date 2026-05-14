package com.sentinel.common.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ReplayStepDTO {
    private Integer stepNumber;
    private UUID eventId;
    private Long timestampNs;
    private String endpoint;
    private String originalDecision;
    private UUID originalSnapshotId;
    private String simulatedDecision;
    private Boolean diverged;
}
