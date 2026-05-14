package com.sentinel.admin.service;

import com.sentinel.admin.repository.EventRepository;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import java.util.HashMap;
import java.util.Map;

@Service
public class MetricsService {

    private final EntityManager entityManager;

    public MetricsService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Map<String, Object> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        Long totalEvents = (Long) entityManager.createQuery("SELECT COUNT(e) FROM EventRecord e").getSingleResult();
        Long totalBlocks = (Long) entityManager.createQuery("SELECT COUNT(e) FROM EventRecord e WHERE e.decision = 'DENY'").getSingleResult();
        
        // Active sessions in last hour
        Long activeSessions = ((Number) entityManager.createNativeQuery(
                "SELECT COUNT(DISTINCT session_id) FROM events WHERE created_at > NOW() - INTERVAL '1 hour'")
                .getSingleResult()).longValue();

        metrics.put("totalEvents", totalEvents);
        metrics.put("totalBlocks", totalBlocks);
        metrics.put("activeSessionsLastHour", activeSessions);

        return metrics;
    }
}
