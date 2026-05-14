package com.sentinel.forensics.controller;

import com.sentinel.forensics.service.ForensicsService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.sentinel.common.entity.EventRecord;

@RestController
@RequestMapping("/api/forensics")
public class ForensicsController {

    private final ForensicsService forensicsService;

    public ForensicsController(ForensicsService forensicsService) {
        this.forensicsService = forensicsService;
    }

    @GetMapping("/verify/{eventId}")
    public ResponseEntity<ForensicsService.VerificationResult> verifyEvent(@PathVariable("eventId") UUID eventId) {
        return ResponseEntity.ok(forensicsService.verifyEvent(eventId));
    }

    @GetMapping("/audit")
    public ResponseEntity<ForensicsService.AuditReport> auditChain(
            @RequestParam("startTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startTime,
            @RequestParam("endTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endTime) {
        return ResponseEntity.ok(forensicsService.auditChain(startTime, endTime));
    }

    @GetMapping("/audit/history")
    public ResponseEntity<List<com.sentinel.common.entity.AuditRecord>> getAuditHistory() {
        return ResponseEntity.ok(forensicsService.getAuditHistory());
    }

    @GetMapping("/events")
    public ResponseEntity<Page<EventRecord>> getEvents(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "endpoint", required = false) String endpoint,
            @RequestParam(name = "decision", required = false) String decision) {
        return ResponseEntity.ok(forensicsService.getEventsPage(page, size, endpoint, decision));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ForensicsService.SessionSummary>> getSessions(
            @RequestParam(name = "size", defaultValue = "12") int size) {
        return ResponseEntity.ok(forensicsService.getRecentSessions(size));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(forensicsService.getStats());
    }

    @GetMapping("/trends")
    public ResponseEntity<List<Map<String, Object>>> getTrends() {
        return ResponseEntity.ok(forensicsService.getTrends());
    }
}
