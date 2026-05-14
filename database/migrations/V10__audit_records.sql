CREATE TABLE audit_records (
    id UUID PRIMARY KEY,
    audit_time TIMESTAMPTZ NOT NULL,
    total_events_checked INTEGER NOT NULL,
    valid BOOLEAN NOT NULL,
    hash_algorithm VARCHAR(50),
    verified_by VARCHAR(100)
);

INSERT INTO audit_records (id, audit_time, total_events_checked, valid, hash_algorithm, verified_by)
VALUES 
    (gen_random_uuid(), NOW() - INTERVAL '1 hour', 5000, true, 'SHA-256', 'SYSTEM_AUDITOR'),
    (gen_random_uuid(), NOW() - INTERVAL '2 hours', 12482, true, 'SHA-256', 'SYSTEM_AUDITOR');
