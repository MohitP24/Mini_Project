package com.sentinel.common.dto;

import lombok.Data;

@Data
public class RiskSignalsDTO {
    private Double requestRate;
    private Double ipReputation;
    private Double jwtAnomaly;
    private Double endpointFrequency;
}
