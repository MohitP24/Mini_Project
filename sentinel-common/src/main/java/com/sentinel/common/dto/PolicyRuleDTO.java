package com.sentinel.common.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class PolicyRuleDTO {
    private String ruleId;
    private Integer version;
    private String name;
    private String description;
    private Object conditions;
    private String decision;
    private Integer priority;
    private Boolean active;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String createdBy;
}
