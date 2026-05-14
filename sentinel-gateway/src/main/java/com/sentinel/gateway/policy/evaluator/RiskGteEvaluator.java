package com.sentinel.gateway.policy.evaluator;

import com.sentinel.common.model.RequestContext;
import com.sentinel.gateway.policy.model.Condition;
import com.sentinel.gateway.policy.model.Operator;
import org.springframework.stereotype.Component;

@Component
public class RiskGteEvaluator implements ConditionEvaluator {

    @Override
    public boolean supports(String conditionType) {
        return "risk".equalsIgnoreCase(conditionType);
    }

    @Override
    public boolean evaluate(Condition condition, RequestContext context) {
        if (context.getCalculatedRisk() == null) return false;
        
        double threshold = 0.0;
        if (condition.getValue() instanceof Number) {
            threshold = ((Number) condition.getValue()).doubleValue();
        } else if (condition.getValue() instanceof String) {
            try {
                threshold = Double.parseDouble((String) condition.getValue());
            } catch (NumberFormatException e) {
                return false;
            }
        }
        
        if (condition.getOperator() == Operator.GTE) {
            return context.getCalculatedRisk().getScore() >= threshold;
        } else if (condition.getOperator() == Operator.LTE) {
            return context.getCalculatedRisk().getScore() <= threshold;
        }
        return false;
    }
}
