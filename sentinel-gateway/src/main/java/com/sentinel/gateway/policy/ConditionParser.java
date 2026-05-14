package com.sentinel.gateway.policy;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.gateway.policy.model.Condition;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class ConditionParser {

    private final ObjectMapper objectMapper;

    public ConditionParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<Condition> parseConditions(String conditionsJson) {
        if (conditionsJson == null || conditionsJson.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(conditionsJson, new TypeReference<List<Condition>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
