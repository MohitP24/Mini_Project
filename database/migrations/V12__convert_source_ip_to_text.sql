-- Change source_ip from inet to text to eliminate ORM type-mismatch issues
ALTER TABLE events ALTER COLUMN source_ip TYPE text;
