package com.sentinel.forensics.service;

import com.sentinel.common.entity.EventRecord;
import com.sentinel.common.util.EventHashUtil;
import com.sentinel.forensics.repository.ForensicsEventRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
public class ForensicsService {

    private final ForensicsEventRepository eventRepository;
    private final com.sentinel.forensics.repository.AuditRecordRepository auditRecordRepository;

    public ForensicsService(ForensicsEventRepository eventRepository, com.sentinel.forensics.repository.AuditRecordRepository auditRecordRepository) {
        this.eventRepository = eventRepository;
        this.auditRecordRepository = auditRecordRepository;
    }

    public VerificationResult verifyEvent(UUID eventId) {
        Optional<EventRecord> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            return new VerificationResult(eventId, false, "Event not found");
        }

        EventRecord event = eventOpt.get();
        
        UUID actualId = event.getEventId();
        event.setEventId(null);
        String recalculatedHash = EventHashUtil.computeHash(event);
        event.setEventId(actualId); // restore

        boolean isValid = recalculatedHash.equals(event.getEventHash());

        return new VerificationResult(
                eventId,
                isValid,
                isValid ? "Valid" : "Tampered: Hash mismatch"
        );
    }

    public AuditReport auditChain(OffsetDateTime startTime, OffsetDateTime endTime) {
        List<EventRecord> events = eventRepository.findEventsInTimeRange(startTime, endTime);
        
        List<VerificationResult> failedVerifications = new ArrayList<>();
        int totalEvents = events.size();
        
        for (EventRecord event : events) {
            UUID actualId = event.getEventId();
            event.setEventId(null);
            String recalculatedHash = EventHashUtil.computeHash(event);
            event.setEventId(actualId);

            if (!recalculatedHash.equals(event.getEventHash())) {
                failedVerifications.add(new VerificationResult(
                        event.getEventId(),
                        false,
                        "Tampered: Expected: " + event.getEventHash() + ", Recalculated: " + recalculatedHash
                ));
            }
        }

        boolean isValid = failedVerifications.isEmpty();

        AuditReport report = new AuditReport(totalEvents, isValid, failedVerifications);
        
        com.sentinel.common.entity.AuditRecord record = new com.sentinel.common.entity.AuditRecord();
        record.setAuditTime(OffsetDateTime.now());
        record.setTotalEventsChecked(totalEvents);
        record.setValid(isValid);
        record.setHashAlgorithm("SHA-256");
        record.setVerifiedBy("SYSTEM_AUDITOR");
        auditRecordRepository.save(record);
        
        return report;
    }

    public List<com.sentinel.common.entity.AuditRecord> getAuditHistory() {
        return auditRecordRepository.findAll();
    }

    public Page<EventRecord> getEventsPage(int page, int size, String endpoint, String decision) {
        return eventRepository.searchEvents(
            (endpoint == null || endpoint.isEmpty()) ? null : endpoint,
            (decision == null || decision.isEmpty()) ? null : decision,
            PageRequest.of(page, size)
        );
    }

    public List<SessionSummary> getRecentSessions(int size) {
        List<UUID> sessionIds = eventRepository.findRecentSessionIds(PageRequest.of(0, size));
        return sessionIds.stream().map(sid -> {
            List<EventRecord> sessionEvents = eventRepository.findAll().stream()
                .filter(e -> sid.equals(e.getSessionId()))
                .sorted(Comparator.comparing(EventRecord::getTimestampNs))
                .collect(Collectors.toList());
            
            if (sessionEvents.isEmpty()) return null;
            
            EventRecord last = sessionEvents.get(sessionEvents.size() - 1);
            float avgRisk = (float) sessionEvents.stream().mapToDouble(EventRecord::getRiskScore).average().orElse(0.0);
            
            return new SessionSummary(
                sid,
                sessionEvents.get(0).getUserId(),
                sessionEvents.size(),
                avgRisk,
                last.getCreatedAt(),
                last.getDecision()
            );
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    public Map<String, Object> getStats() {
        long totalRequests = eventRepository.count();
        long securityBlocks = eventRepository.findAll().stream().filter(e -> "DENY".equals(e.getDecision())).count();
        long activeSessions = eventRepository.findRecentSessionIds(PageRequest.of(0, 1000)).size();
        double avgRisk = eventRepository.findAll().stream().mapToDouble(EventRecord::getRiskScore).average().orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRequests", totalRequests);
        stats.put("securityBlocks", securityBlocks);
        stats.put("activeSessions", activeSessions);
        stats.put("avgRiskScore", avgRisk);
        return stats;
    }

    public List<Map<String, Object>> getTrends() {
        // Return last 7 hours of data (mocked grouping for simplicity in this demo)
        List<Map<String, Object>> trends = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now();
        for (int i = 6; i >= 0; i--) {
            OffsetDateTime hour = now.minusHours(i);
            Map<String, Object> point = new HashMap<>();
            point.put("time", hour.getHour() + ":00");
            point.put("events", 400 + (int)(Math.random() * 400));
            point.put("risk", 0.1 + Math.random() * 0.4);
            trends.add(point);
        }
        return trends;
    }

    public record VerificationResult(UUID eventId, boolean valid, String message) {}
    public record AuditReport(int totalEventsChecked, boolean chainValid, List<VerificationResult> tamperingDetails) {}
    public record SessionSummary(UUID sessionId, String userId, int eventCount, float avgRiskScore, OffsetDateTime lastActivity, String lastDecision) {}
}
