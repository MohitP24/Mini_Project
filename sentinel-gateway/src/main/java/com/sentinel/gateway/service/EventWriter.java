package com.sentinel.gateway.service;

import com.sentinel.common.entity.EventRecord;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventWriter {

    private final EntityManager entityManager;

    @Transactional
    public void writeEvent(EventRecord event) {
        try {
            entityManager.persist(event);
            log.debug("Persisted event: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to persist event", e);
        }
    }
}
