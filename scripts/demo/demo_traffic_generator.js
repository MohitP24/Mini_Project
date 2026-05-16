import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GATEWAY_URL = 'http://127.0.0.1:8080';
const PRIVATE_KEY_PATH = path.resolve(__dirname, '../../secrets/sentinel_private_key.pem');

// Load private key for signing JWTs
let privateKey;
try {
  privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
} catch (e) {
  console.error(`Failed to read private key at ${PRIVATE_KEY_PATH}. Did you run generate_rsa_keys.sh?`);
  process.exit(1);
}

// ═══════════════════════════════════════════════════════
// SCENARIO DEFINITIONS — Each maps to a real anomaly
// the Sentinel Policy Engine evaluates
// ═══════════════════════════════════════════════════════

const SCENARIOS = [
  // ── 1. NORMAL TRAFFIC (baseline) ──────────────────────
  {
    name: '✅ Normal User',
    weight: 30,
    user: { id: 'user-bob', roles: ['ROLE_USER'] },
    ip: '192.168.1.15',
    endpoints: ['/api/users/profile', '/api/payments/process'],
    methods: ['GET', 'POST'],
    anomaly: null,
    tokenOptions: { valid: true },
  },
  {
    name: '✅ Admin Workflow',
    weight: 15,
    user: { id: 'admin-alice', roles: ['ROLE_ADMIN', 'POLICY_ADMIN'] },
    ip: '10.0.0.5',
    endpoints: ['/api/admin/dashboard', '/api/users/profile', '/api/payments/process'],
    methods: ['GET', 'POST'],
    anomaly: null,
    tokenOptions: { valid: true },
  },

  // ── 2. JWT ANOMALY — Missing token / expired / wrong issuer ──
  {
    name: '🔐 JWT: No Token',
    weight: 8,
    user: null,
    ip: '203.0.113.42',
    endpoints: ['/api/payments/process', '/api/admin/dashboard'],
    methods: ['POST', 'GET'],
    anomaly: 'jwt_missing',
    tokenOptions: { skip: true },
  },
  {
    name: '🔐 JWT: Expired Token',
    weight: 5,
    user: { id: 'expired-user', roles: ['ROLE_USER'] },
    ip: '192.168.1.80',
    endpoints: ['/api/users/profile', '/api/payments/process'],
    methods: ['GET', 'POST'],
    anomaly: 'jwt_expired',
    tokenOptions: { valid: true, expiresIn: '-10s' },
  },
  {
    name: '🔐 JWT: Wrong Issuer',
    weight: 5,
    user: { id: 'foreign-service', roles: ['ROLE_SERVICE'] },
    ip: '172.16.5.99',
    endpoints: ['/api/users/profile'],
    methods: ['GET'],
    anomaly: 'jwt_wrong_issuer',
    tokenOptions: { valid: true, issuer: 'malicious-auth' },
  },
  {
    name: '🔐 JWT: Empty Roles',
    weight: 5,
    user: { id: 'norole-dan', roles: [] },
    ip: '10.0.0.20',
    endpoints: ['/api/users/profile', '/api/admin/dashboard'],
    methods: ['GET'],
    anomaly: 'jwt_no_roles',
    tokenOptions: { valid: true },
  },

  // ── 3. IP REPUTATION — Suspicious / blacklisted IPs ──
  {
    name: '🌐 IP: Known Bad Actor',
    weight: 8,
    user: { id: 'hacker-eve', roles: ['ROLE_USER'] },
    ip: '198.51.100.7',
    endpoints: ['/api/admin/dashboard', '/api/payments/process'],
    methods: ['GET', 'POST'],
    anomaly: 'ip_bad_reputation',
    tokenOptions: { valid: true },
  },
  {
    name: '🌐 IP: External Probe',
    weight: 5,
    user: { id: 'scanner-bot', roles: ['ROLE_USER'] },
    ip: '45.33.32.156',
    endpoints: ['/api/admin/dashboard', '/api/users/profile', '/api/payments/process'],
    methods: ['GET', 'POST'],
    anomaly: 'ip_external_scanner',
    tokenOptions: { valid: true },
  },
  {
    name: '🌐 IP: Tor Exit Node',
    weight: 3,
    user: { id: 'anon-tor', roles: ['ROLE_USER'] },
    ip: '185.220.101.42',
    endpoints: ['/api/payments/process'],
    methods: ['POST'],
    anomaly: 'ip_tor_exit',
    tokenOptions: { valid: true },
  },

  // ── 4. ENDPOINT FREQUENCY — Burst / rapid-fire attacks ──
  {
    name: '⚡ Endpoint: Payment Flood',
    weight: 5,
    user: { id: 'fraud-frank', roles: ['ROLE_USER'] },
    ip: '203.0.113.99',
    endpoints: ['/api/payments/process'],
    methods: ['POST'],
    anomaly: 'endpoint_flood',
    tokenOptions: { valid: true },
    burstCount: 5,
    burstDelay: 50,
  },
  {
    name: '⚡ Endpoint: Admin Scrape',
    weight: 3,
    user: { id: 'scraper-sam', roles: ['ROLE_USER'] },
    ip: '198.51.100.22',
    endpoints: ['/api/admin/dashboard'],
    methods: ['GET'],
    anomaly: 'endpoint_scrape',
    tokenOptions: { valid: true },
    burstCount: 8,
    burstDelay: 30,
  },

  // ── 5. ROLE-BASED ACCESS VIOLATIONS ───────────────────
  {
    name: '🚫 Role: Guest → Admin',
    weight: 5,
    user: { id: 'guest-charlie', roles: ['ROLE_GUEST'] },
    ip: '203.0.113.42',
    endpoints: ['/api/admin/dashboard'],
    methods: ['GET'],
    anomaly: 'role_escalation',
    tokenOptions: { valid: true },
  },
  {
    name: '🚫 Role: User → Payments',
    weight: 3,
    user: { id: 'sneaky-steve', roles: ['ROLE_VIEWER'] },
    ip: '10.0.0.35',
    endpoints: ['/api/payments/process'],
    methods: ['POST'],
    anomaly: 'role_unauthorized_payment',
    tokenOptions: { valid: true },
  },
];

// ═══════════════════════════════════════════════════════
// TOKEN GENERATION
// ═══════════════════════════════════════════════════════

function generateToken(user, options = {}) {
  if (options.skip) return null;

  const payload = {
    sub: user.id,
    roles: user.roles,
  };

  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: options.expiresIn || '1h',
    issuer: options.issuer || 'sentinel-auth',
    audience: 'sentinel-api',
  });
}

// ═══════════════════════════════════════════════════════
// WEIGHTED RANDOM SCENARIO PICKER
// ═══════════════════════════════════════════════════════

function pickScenario() {
  const totalWeight = SCENARIOS.reduce((s, sc) => s + sc.weight, 0);
  let r = Math.random() * totalWeight;
  for (const sc of SCENARIOS) {
    r -= sc.weight;
    if (r <= 0) return sc;
  }
  return SCENARIOS[0];
}

// ═══════════════════════════════════════════════════════
// REQUEST FIRING
// ═══════════════════════════════════════════════════════

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fireSingleRequest(scenario) {
  const endpoint = scenario.endpoints[Math.floor(Math.random() * scenario.endpoints.length)];
  const method = scenario.methods[Math.floor(Math.random() * scenario.methods.length)];

  const headers = {
    'X-Forwarded-For': scenario.ip,
    'User-Agent': `Sentinel-Demo/${scenario.anomaly || 'normal'}`,
    'Content-Type': 'application/json',
  };

  if (scenario.user && !scenario.tokenOptions.skip) {
    const token = generateToken(scenario.user, scenario.tokenOptions);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${GATEWAY_URL}${endpoint}`, { method, headers });
    await res.text();

    const statusColor =
      res.status >= 200 && res.status < 300 ? '\x1b[32m' :
      res.status === 401 ? '\x1b[33m' :
      res.status === 403 ? '\x1b[31m' :
      '\x1b[35m';

    const decisionLabel =
      res.status === 200 ? 'ALLOW' :
      res.status === 401 ? 'UNAUTH' :
      res.status === 403 ? 'DENY' :
      `HTTP ${res.status}`;

    console.log(
      `[${new Date().toLocaleTimeString()}] ` +
      `${scenario.ip.padEnd(18)}| ` +
      `${(scenario.user?.id || 'NO_TOKEN').padEnd(18)}| ` +
      `${method.padEnd(5)} ${endpoint.padEnd(25)}| ` +
      `${statusColor}${decisionLabel.padEnd(8)}\x1b[0m | ` +
      `${scenario.name}`
    );
  } catch (error) {
    console.log(`[${new Date().toLocaleTimeString()}] ${scenario.ip.padEnd(18)}| ERROR: ${error.message}`);
  }
}

async function fireScenario(scenario) {
  if (scenario.burstCount) {
    // Burst mode — simulate rapid-fire requests
    for (let i = 0; i < scenario.burstCount; i++) {
      await fireSingleRequest(scenario);
      await sleep(scenario.burstDelay || 50);
    }
  } else {
    await fireSingleRequest(scenario);
  }
}

// ═══════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function runDemo() {
  console.clear();
  console.log('');
  console.log('\x1b[36m╔══════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║     🛡️  SENTINEL — Advanced Security Traffic Simulator  🛡️      ║\x1b[0m');
  console.log('\x1b[36m╚══════════════════════════════════════════════════════════════════╝\x1b[0m');
  console.log('');
  console.log('\x1b[90m  Target: ' + GATEWAY_URL + '\x1b[0m');
  console.log('');
  console.log('\x1b[33m  🎮  Interactive Menu:\x1b[0m');
  console.log('  [Enter]       - Fire a random scenario');
  console.log('  [1-13]        - Fire a specific scenario (e.g., "1" for Normal Bob, "9" for Tor)');
  console.log('  [auto]        - Switch to automated continuous mode');
  console.log('  [list]        - List all available scenarios');
  console.log('  [exit]        - Stop the generator');
  console.log('');
  console.log('\x1b[90m  IP                | USER              | METHOD ENDPOINT                 | RESULT   | SCENARIO\x1b[0m');
  console.log('\x1b[90m  ─────────────────────────────────────────────────────────────────────────────────────────────────\x1b[0m');

  let mode = 'manual';

  const listScenarios = () => {
    console.log('\n\x1b[36mAvailable Scenarios:\x1b[0m');
    SCENARIOS.forEach((s, i) => console.log(`  ${(i + 1).toString().padStart(2)}. ${s.name}`));
    console.log('');
  };

  const handleInput = async (input) => {
    const cmd = input.trim().toLowerCase();

    if (cmd === 'exit' || cmd === 'quit') {
      console.log('\x1b[31mStopping Sentinel Generator...\x1b[0m');
      process.exit(0);
    }

    if (cmd === 'list') {
      listScenarios();
      prompt();
      return;
    }

    if (cmd === 'auto') {
      mode = 'auto';
      console.log('\x1b[32m>>> Switched to AUTO mode. Type "manual" to stop.\x1b[0m');
      autoLoop();
      return;
    }

    if (cmd === 'manual') {
      mode = 'manual';
      console.log('\x1b[33m>>> Switched to MANUAL mode.\x1b[0m');
      prompt();
      return;
    }

    let scenario;
    const num = parseInt(cmd);
    if (!isNaN(num) && num >= 1 && num <= SCENARIOS.length) {
      scenario = SCENARIOS[num - 1];
    } else {
      scenario = pickScenario();
    }

    await fireScenario(scenario);
    if (mode === 'manual') prompt();
  };

  const prompt = () => {
    if (mode === 'manual') {
      rl.question('\x1b[33mSentinel > \x1b[0m', handleInput);
    }
  };

  const autoLoop = async () => {
    if (mode !== 'auto') return;
    
    // Check if user typed "manual" while in auto loop
    // Note: In Node.js, rl.on('line') is better for this but for simplicity here:
    const scenario = pickScenario();
    await fireScenario(scenario);
    
    // Check for input during auto loop
    setTimeout(autoLoop, Math.random() * 1000 + 500);
  };

  // Listen for 'manual' command during auto mode
  rl.on('line', (line) => {
    if (mode === 'auto' && line.trim().toLowerCase() === 'manual') {
      mode = 'manual';
      console.log('\x1b[33m>>> Switched to MANUAL mode.\x1b[0m');
      prompt();
    }
  });

  prompt();
}

runDemo();
