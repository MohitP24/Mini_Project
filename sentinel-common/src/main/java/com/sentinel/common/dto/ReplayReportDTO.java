package com.sentinel.common.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class ReplayReportDTO {
    private String policyId;
    private List<ReplayStepDTO> steps;
    private Integer totalEventsEvaluated;
    private Integer divergedCount;
    private Integer originalDenyCount;
    private Integer simulatedDenyCount;
    private Integer firstDivergenceStep;
}
