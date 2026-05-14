package com.sentinel.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.admin.repository.EventRepository;
import com.sentinel.common.dto.ReplayReportDTO;
import com.sentinel.common.dto.ReplayStepDTO;
import com.sentinel.common.entity.EventRecord;
import com.sentinel.common.entity.PolicyRule;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ReplayService {

    private final EventRepository eventRepository;
    private final ObjectMapper objectMapper;

    public ReplayService(EventRepository eventRepository, ObjectMapper objectMapper) {
        this.eventRepository = eventRepository;
        this.objectMapper = objectMapper;
    }

    public ReplayReportDTO replayPolicy(PolicyRule rule, int limit) {
        // Fetch recent events
        List<EventRecord> recentEvents = eventRepository.findAll().stream()
                .limit(limit)
                .toList();

        List<ReplayStepDTO> steps = new ArrayList<>();
        int divergedCount = 0;

        for (int i = 0; i < recentEvents.size(); i++) {
            EventRecord event = recentEvents.get(i);
            
            // Simplified dry-run logic for Admin API
            // In a real system, we'd use the full Gateway RuleEvaluator or a shared engine.
            String simulatedDecision = simulateDecision(event, rule);
            boolean diverged = !simulatedDecision.equals(event.getDecision());
            
            if (diverged) divergedCount++;

            ReplayStepDTO step = new ReplayStepDTO();
            step.setStepNumber(i + 1);
            step.setEventId(event.getEventId());
            step.setTimestampNs(event.getTimestampNs());
            step.setEndpoint(event.getEndpoint());
            step.setOriginalDecision(event.getDecision());
            step.setOriginalSnapshotId(event.getPolicyRuleSnapshotId());
            step.setSimulatedDecision(simulatedDecision);
            step.setDiverged(diverged);

            steps.add(step);
        }

        ReplayReportDTO report = new ReplayReportDTO();
        report.setPolicyId(rule.getRuleId());
        report.setTotalEventsEvaluated(steps.size());
        report.setDivergedCount(divergedCount);
        report.setSteps(steps);

        return report;
    }

    private String simulateDecision(EventRecord event, PolicyRule rule) {
        try {
            List<Map<String, Object>> conditions = objectMapper.readValue(rule.getConditions(), new TypeReference<>() {});
            boolean allMet = true;
            for (Map<String, Object> condition : conditions) {
                String type = (String) condition.get("type");
                if ("ip".equals(type)) {
                    // Very basic simulation
                    if (!String.valueOf(condition.get("value")).contains(event.getSourceIp())) {
                         allMet = false;
                         break;
                    }
                }
            }
            return allMet ? rule.getDecision() : "ALLOW";
        } catch (Exception e) {
            return "ALLOW";
        }
    }
}
