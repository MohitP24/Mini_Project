-- Flyway: V6__append_only_triggers.sql
CREATE OR REPLACE FUNCTION prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Table % is append-only. UPDATE and DELETE are FORBIDDEN.', TG_TABLE_NAME;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_append_only
BEFORE UPDATE OR DELETE ON events
FOR EACH ROW EXECUTE FUNCTION prevent_modification();

CREATE TRIGGER policy_history_append_only
BEFORE UPDATE OR DELETE ON policy_rules_history
FOR EACH ROW EXECUTE FUNCTION prevent_modification();
