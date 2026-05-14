-- Flyway: V5__create_sessions_table.sql
CREATE TABLE IF NOT EXISTS sessions_summary (
    session_id          UUID          PRIMARY KEY,
    first_seen_ns       BIGINT        NOT NULL,
    last_seen_ns        BIGINT        NOT NULL,
    event_count         INTEGER       NOT NULL DEFAULT 0,
    max_risk_score      FLOAT4,
    deny_count          INTEGER       NOT NULL DEFAULT 0,
    user_id             VARCHAR(255),
    flagged             BOOLEAN       NOT NULL DEFAULT FALSE,
    endpoints_accessed  JSONB,
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
