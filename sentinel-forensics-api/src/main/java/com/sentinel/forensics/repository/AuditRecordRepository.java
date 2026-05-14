package com.sentinel.forensics.repository;

import com.sentinel.common.entity.AuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface AuditRecordRepository extends JpaRepository<AuditRecord, UUID> {
}
