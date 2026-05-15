package com.sentinel.admin.service;

import com.sentinel.common.entity.PolicyRule;
import com.sentinel.admin.repository.PolicyRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PolicyAdminService {

    private final PolicyRuleRepository repository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public PolicyAdminService(PolicyRuleRepository repository, 
                              org.springframework.jdbc.core.JdbcTemplate jdbcTemplate,
                              com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public List<PolicyRule> getAllPolicies() {
        return repository.findAll(org.springframework.data.domain.Sort.by("priority").descending());
    }

    public Optional<PolicyRule> getPolicy(String id) {
        return repository.findById(id);
    }

    @Transactional
    public PolicyRule createOrUpdatePolicy(PolicyRule rule) {
        if (rule.getRuleId() == null || rule.getRuleId().isEmpty()) {
            rule.setRuleId("POL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (rule.getActive() == null) rule.setActive(true);
        if (rule.getPriority() == null) rule.setPriority(100);

        Optional<PolicyRule> existing = repository.findById(rule.getRuleId());
        if (existing.isPresent()) {
            rule.setVersion(existing.get().getVersion() + 1);
            rule.setCreatedAt(existing.get().getCreatedAt());
        } else {
            rule.setVersion(1);
            rule.setCreatedAt(OffsetDateTime.now());
        }
        
        rule.setUpdatedAt(OffsetDateTime.now());
        
        // Ensure snapshot ID is generated (simulating V4 table defaults if not present)
        if (rule.getSnapshotId() == null) {
            rule.setSnapshotId(UUID.randomUUID());
        }
        
        return repository.save(rule);
    }

    @Transactional
    public void deactivatePolicy(String id) {
        repository.findById(id).ifPresent(rule -> {
            rule.setActive(false);
            rule.setUpdatedAt(OffsetDateTime.now());
            repository.save(rule);
        });
    }

    public SimulationResult simulateProposedPolicy(String conditionsJson, String scope) {
        // 1. Parse the draft conditions using production-grade parser
        List<com.sentinel.common.policy.Condition> draftConditionsParsed;
        try {
            draftConditionsParsed = objectMapper.readValue(conditionsJson, 
                new com.fasterxml.jackson.core.type.TypeReference<List<com.sentinel.common.policy.Condition>>() {});
        } catch (Exception e) {
            draftConditionsParsed = java.util.Collections.emptyList();
        }
        final List<com.sentinel.common.policy.Condition> draftConditions = draftConditionsParsed;

        // 2. Fetch REAL historical data from the events table
        String sql = "SELECT event_id, endpoint, source_ip, decision, roles, risk_score FROM events " +
                    "WHERE source_ip LIKE ? OR endpoint LIKE ? " +
                    "ORDER BY created_at DESC LIMIT 20";
        
        String searchPattern = "%" + (scope != null ? scope : "") + "%";
        
        List<SimulationStep> steps = jdbcTemplate.query(sql, (rs, rowNum) -> {
            String eventId = rs.getString("event_id");
            String endpoint = rs.getString("endpoint");
            String sourceIp = rs.getString("source_ip");
            String originalDecision = rs.getString("decision");
            String rolesJson = rs.getString("roles");
            double riskScore = rs.getDouble("risk_score");
            
            // 3. Construct a real RequestContext for this historical event
            List<String> roles = java.util.Collections.emptyList();
            try {
                roles = objectMapper.readValue(rolesJson, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
            } catch (Exception ignored) {}

            com.sentinel.common.model.RequestContext context = com.sentinel.common.model.RequestContext.builder()
                    .sourceIp(sourceIp)
                    .endpoint(endpoint)
                    .roles(roles)
                    .riskScore(riskScore)
                    .build();

            // 4. EFFICIENT & TRUTHFUL: Use the same CorePolicyEngine that the Gateway uses
            boolean isMatch = com.sentinel.common.policy.CorePolicyEngine.evaluateConditions(draftConditions, context);
            String simulatedDecision = isMatch ? "DENY" : originalDecision;
            
            return new SimulationStep(rowNum + 1, eventId, endpoint, originalDecision, simulatedDecision);
        }, searchPattern, searchPattern);

        int totalEvaluated = steps.size();
        long divergedCount = steps.stream()
                .filter(s -> !s.originalDecision().equals(s.simulatedDecision()))
                .count();
        
        return new SimulationResult(totalEvaluated, (int) divergedCount, steps);
    }

    public static record SimulationResult(int totalEventsEvaluated, int divergedCount, List<SimulationStep> steps) {}
    public static record SimulationStep(int stepNumber, String eventId, String endpoint, String originalDecision, String simulatedDecision) {}
}
