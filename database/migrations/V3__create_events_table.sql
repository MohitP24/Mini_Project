-- Flyway: V3__create_events_table.sql
CREATE TABLE IF NOT EXISTS events (
    event_id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp_ns            BIGINT        NOT NULL,
    event_type              VARCHAR(50)   NOT NULL,
    session_id              UUID          NOT NULL,
    user_id                 VARCHAR(255),
    roles                   JSONB,
    endpoint                VARCHAR(512)  NOT NULL,
    http_method             VARCHAR(10)   NOT NULL,
    source_ip               INET          NOT NULL,
    user_agent              TEXT,
    policy_rule_id          VARCHAR(100),
    policy_rule_version     INTEGER,
    policy_rule_snapshot_id UUID,         -- FK will be added in V4 to prevent dependency issues
    risk_score              FLOAT4,
    risk_signals            JSONB,
    decision                VARCHAR(10),
    request_context         JSONB,
    body_hash               VARCHAR(64),
    event_hash              VARCHAR(64)   NOT NULL,
    gateway_version         VARCHAR(50)   NOT NULL,
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_session     ON events (session_id, timestamp_ns);
CREATE INDEX idx_events_timestamp   ON events (timestamp_ns);
CREATE INDEX idx_events_user        ON events (user_id, timestamp_ns);
CREATE INDEX idx_events_type        ON events (event_type);
CREATE INDEX idx_events_risk        ON events (risk_score);
CREATE INDEX idx_events_endpoint    ON events (endpoint, http_method);
CREATE INDEX idx_events_snapshot    ON events (policy_rule_snapshot_id);
CREATE INDEX idx_events_decision    ON events (decision);
