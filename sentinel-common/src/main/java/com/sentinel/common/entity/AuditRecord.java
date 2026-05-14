package com.sentinel.common.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_records")
@Data
public class AuditRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    private OffsetDateTime auditTime;
    private int totalEventsChecked;
    private boolean valid;
    private String hashAlgorithm;
    private String verifiedBy;
}
