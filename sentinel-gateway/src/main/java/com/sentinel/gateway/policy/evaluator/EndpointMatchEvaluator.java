package com.sentinel.gateway.policy.evaluator;

import com.sentinel.common.model.RequestContext;
import com.sentinel.gateway.policy.model.Condition;
import com.sentinel.gateway.policy.model.Operator;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EndpointMatchEvaluator implements ConditionEvaluator {

    @Override
    public boolean supports(String conditionType) {
        return "endpoint".equalsIgnoreCase(conditionType);
    }

    @Override
    public boolean evaluate(Condition condition, RequestContext context) {
        String endpoint = context.getEndpoint();
        if (endpoint == null) return false;

        boolean match = false;
        if (condition.getValue() instanceof String) {
            String pattern = (String) condition.getValue();
            String regex = pattern.replace("**", ".*").replace("*", ".*").replace("..*", ".*"); // handle both safely
            match = endpoint.matches(regex);
        } else if (condition.getValue() instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> patterns = (List<String>) condition.getValue();
            match = patterns.stream().anyMatch(p -> endpoint.matches(p.replace("**", ".*").replace("*", ".*").replace("..*", ".*")));
        }

        if (condition.getOperator() == Operator.MATCHES) {
            return match;
        } else if (condition.getOperator() == Operator.NOT_MATCHES) {
            return !match;
        }
        return false;
    }
}
