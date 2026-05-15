-- Flyway: V11__convert_event_json_columns_to_text.sql
ALTER TABLE events
    ALTER COLUMN roles TYPE TEXT USING roles::text,
    ALTER COLUMN risk_signals TYPE TEXT USING risk_signals::text,
    ALTER COLUMN request_context TYPE TEXT USING request_context::text;
