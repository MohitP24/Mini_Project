-- Flyway: V4__create_policy_tables.sql
CREATE TABLE IF NOT EXISTS policy_rules (
    rule_id     VARCHAR(100) PRIMARY KEY,
    version     INTEGER      NOT NULL DEFAULT 1,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    conditions  JSONB        NOT NULL,
    decision    VARCHAR(10)  NOT NULL CHECK (decision IN ('ALLOW','DENY')),
    priority    INTEGER      NOT NULL DEFAULT 100,
    active      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS policy_rules_history (
    snapshot_id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id          VARCHAR(100) NOT NULL REFERENCES policy_rules(rule_id),
    version          INTEGER      NOT NULL,
    full_conditions  JSONB        NOT NULL,
    decision         VARCHAR(10)  NOT NULL,
    activated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    activated_by     VARCHAR(255) NOT NULL,
    deactivated_at   TIMESTAMPTZ
);

-- Add foreign key constraint to events table (which was created in V3)
ALTER TABLE events ADD CONSTRAINT fk_events_policy_snapshot FOREIGN KEY (policy_rule_snapshot_id) REFERENCES policy_rules_history(snapshot_id);
