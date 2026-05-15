package com.sentinel.gateway.policy.evaluator;

import com.sentinel.common.model.RequestContext;
import com.sentinel.gateway.policy.model.Condition;
import org.springframework.stereotype.Component;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Component
public class TimeMatchEvaluator implements ConditionEvaluator {
    
    @Override
    public boolean supports(String type) {
        return "time-range".equalsIgnoreCase(type);
    }

    @Override
    public boolean evaluate(Condition condition, RequestContext context) {
        try {
            // Expected value format: "09:00-17:00"
            String value = String.valueOf(condition.getValue());
            String[] times = value.split("-");
            LocalTime start = LocalTime.parse(times[0], DateTimeFormatter.ofPattern("HH:mm"));
            LocalTime end = LocalTime.parse(times[1], DateTimeFormatter.ofPattern("HH:mm"));
            LocalTime now = LocalTime.now();
            
            return !now.isBefore(start) && !now.isAfter(end);
        } catch (Exception e) {
            return false; // Fail secure if parsing breaks
        }
    }
}
