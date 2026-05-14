package com.sentinel.gateway.policy.evaluator;

import com.sentinel.common.model.RequestContext;
import com.sentinel.gateway.policy.model.Condition;
import com.sentinel.gateway.policy.model.Operator;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class RoleMatchEvaluator implements ConditionEvaluator {

    @Override
    public boolean supports(String conditionType) {
        return "role".equalsIgnoreCase(conditionType);
    }

    @Override
    public boolean evaluate(Condition condition, RequestContext context) {
        List<String> userRoles = context.getRoles() != null ? context.getRoles() : Collections.emptyList();
        
        List<String> requiredRoles;
        if (condition.getValue() instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> list = (List<String>) condition.getValue();
            requiredRoles = list;
        } else if (condition.getValue() instanceof String) {
            requiredRoles = List.of((String) condition.getValue());
        } else {
            return false;
        }
        
        if (condition.getOperator() == Operator.HAS_ANY) {
            return requiredRoles.stream().anyMatch(userRoles::contains);
        } else if (condition.getOperator() == Operator.HAS_ALL) {
            return userRoles.containsAll(requiredRoles);
        } else if (condition.getOperator() == Operator.NOT_IN) {
             return requiredRoles.stream().noneMatch(userRoles::contains);
        }
        
        return false;
    }
}
