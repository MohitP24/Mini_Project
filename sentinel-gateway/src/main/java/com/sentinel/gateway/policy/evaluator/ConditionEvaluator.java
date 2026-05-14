package com.sentinel.gateway.policy.evaluator;

import com.sentinel.common.model.RequestContext;
import com.sentinel.gateway.policy.model.Condition;

public interface ConditionEvaluator {
    boolean supports(String conditionType);
    boolean evaluate(Condition condition, RequestContext context);
}
