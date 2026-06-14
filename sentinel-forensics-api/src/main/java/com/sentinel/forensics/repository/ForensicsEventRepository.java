package com.sentinel.forensics.repository;

import com.sentinel.common.entity.EventRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ForensicsEventRepository extends JpaRepository<EventRecord, UUID> {
    @Query("SELECT e FROM EventRecord e WHERE e.createdAt >= :startTime AND e.createdAt <= :endTime ORDER BY e.timestampNs ASC")
    List<EventRecord> findEventsInTimeRange(@org.springframework.data.repository.query.Param("startTime") OffsetDateTime startTime, @org.springframework.data.repository.query.Param("endTime") OffsetDateTime endTime);

    @Query("SELECT e FROM EventRecord e WHERE " +
           "(:endpoint IS NULL OR e.endpoint LIKE %:endpoint%) AND " +
           "(:decision IS NULL OR e.decision LIKE %:decision%) " +
           "ORDER BY e.timestampNs DESC")
    org.springframework.data.domain.Page<EventRecord> searchEvents(@org.springframework.data.repository.query.Param("endpoint") String endpoint, @org.springframework.data.repository.query.Param("decision") String decision, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT DISTINCT e.sessionId FROM EventRecord e ORDER BY e.sessionId DESC")
    List<UUID> findRecentSessionIds(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT MAX(e.createdAt) FROM EventRecord e")
    OffsetDateTime findLatestEventTime();
}
