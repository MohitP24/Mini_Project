-- Flyway: V2__create_roles.sql
-- We will assume PostgreSQL 15.6 environment and that these users might not exist.
-- To allow rerunnability or simple handling, we wrap role creation in an anonymous block.
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'sentinel_app') THEN
      CREATE ROLE sentinel_app WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
   END IF;
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'event_writer') THEN
      CREATE ROLE event_writer WITH LOGIN PASSWORD '${EVENT_WRITER_PASSWORD}';
   END IF;
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'sentinel_reader') THEN
      CREATE ROLE sentinel_reader WITH LOGIN PASSWORD '${SENTINEL_READER_PASSWORD}';
   END IF;
END
$do$;
