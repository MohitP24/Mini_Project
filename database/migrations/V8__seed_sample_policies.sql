-- Flyway: V8__seed_sample_policies.sql
INSERT INTO policy_rules (rule_id, version, name, description, conditions, decision, priority, active, created_by)
VALUES 
('RULE-1', 1, 'Allow Dev Traffic', 'Allows traffic from local dev IPs', '[{"type":"ip","operator":"IN","value":["127.0.0.1/32"]}]', 'ALLOW', 10, false, 'system'),
('RULE-2', 1, 'Deny High Risk', 'Denies requests with high risk score', '[{"type":"risk","operator":"GTE","value":0.8}]', 'DENY', 1, false, 'system'),
('RULE-3', 1, 'Allow Admin API', 'Allows admins to access /admin API', '[{"type":"endpoint","operator":"MATCHES","value":"/api/admin/*"},{"type":"role","operator":"HAS_ANY","value":["POLICY_ADMIN"]}]', 'ALLOW', 5, false, 'system');
