package com.sentinel.gateway.policy.evaluator;

import com.sentinel.common.model.RequestContext;
import com.sentinel.common.util.IpUtil;
import com.sentinel.gateway.policy.model.Condition;
import com.sentinel.gateway.policy.model.Operator;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class IpMatchEvaluator implements ConditionEvaluator {

    @Override
    public boolean supports(String conditionType) {
        return "ip".equalsIgnoreCase(conditionType);
    }

    @Override
    public boolean evaluate(Condition condition, RequestContext context) {
        String clientIp = context.getSourceIp();
        if (clientIp == null) return false;

        boolean match = false;
        if (condition.getValue() instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> cidrs = (List<String>) condition.getValue();
            match = cidrs.stream().anyMatch(cidr -> IpUtil.isIpInCidr(clientIp, cidr));
        } else if (condition.getValue() instanceof String) {
            match = IpUtil.isIpInCidr(clientIp, (String) condition.getValue());
        }

        if (condition.getOperator() == Operator.IN) {
            return match;
        } else if (condition.getOperator() == Operator.NOT_IN) {
            return !match;
        }
        return false;
    }
}
