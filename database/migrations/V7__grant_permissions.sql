-- Flyway: V7__grant_permissions.sql
-- sentinel_app is the main application user and owner.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sentinel_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sentinel_app;

-- event_writer has ONLY insert privileges on events table.
GRANT INSERT ON TABLE events TO event_writer;

-- sentinel_reader has ONLY select privileges.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sentinel_reader;
