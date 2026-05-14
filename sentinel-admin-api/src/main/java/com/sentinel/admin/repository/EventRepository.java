package com.sentinel.admin.repository;

import com.sentinel.common.entity.EventRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<EventRecord, UUID>, JpaSpecificationExecutor<EventRecord> {
}
