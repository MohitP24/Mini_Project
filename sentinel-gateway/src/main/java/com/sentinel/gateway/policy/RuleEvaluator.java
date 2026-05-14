package com.sentinel.gateway.policy;

import com.sentinel.common.entity.PolicyRule;
import com.sentinel.common.model.Decision;
import com.sentinel.common.model.RequestContext;
import com.sentinel.gateway.policy.evaluator.ConditionEvaluator;
import com.sentinel.gateway.policy.model.Condition;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class RuleEvaluator {

    private final PolicyCacheManager cacheManager;
    private final ConditionParser conditionParser;
    private final List<ConditionEvaluator> evaluators;

    public RuleEvaluator(PolicyCacheManager cacheManager, ConditionParser conditionParser, List<ConditionEvaluator> evaluators) {
        this.cacheManager = cacheManager;
        this.conditionParser = conditionParser;
        this.evaluators = evaluators;
    }

    public EvaluationResult evaluate(RequestContext context) {
        List<PolicyRule> activeRules = cacheManager.getActiveRules();

        for (PolicyRule rule : activeRules) {
            List<Condition> conditions = conditionParser.parseConditions(rule.getConditions());
            
            boolean allConditionsMet = true;
            for (Condition condition : conditions) {
                Optional<ConditionEvaluator> evaluatorOpt = evaluators.stream()
                        .filter(e -> e.supports(condition.getType()))
                        .findFirst();

                if (evaluatorOpt.isPresent()) {
                    boolean result = evaluatorOpt.get().evaluate(condition, context);
                    if (!result) {
                        allConditionsMet = false;
                        break;
                    }
                } else {
                    log.warn("No evaluator found for condition type: {}", condition.getType());
                    allConditionsMet = false;
                    break;
                }
            }

            if (allConditionsMet && !conditions.isEmpty()) {
                Decision decision = Decision.valueOf(rule.getDecision());
                return new EvaluationResult(decision, rule);
            }
        }
        
        return new EvaluationResult(Decision.ALLOW, null); // Default allow
    }

    public record EvaluationResult(Decision decision, PolicyRule rule) {}
}
