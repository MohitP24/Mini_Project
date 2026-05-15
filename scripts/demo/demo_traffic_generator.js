import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GATEWAY_URL = 'http://localhost:8080';
const PRIVATE_KEY_PATH = path.resolve(__dirname, '../../secrets/sentinel_private_key.pem');

// Load private key for signing JWTs
let privateKey;
try {
  privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
} catch (e) {
  console.error(`Failed to read private key at ${PRIVATE_KEY_PATH}. Did you run generate_rsa_keys.sh?`);
  process.exit(1);
}

// Demo users to simulate
const USERS = [
  { id: 'user-bob', role: 'ROLE_USER', ip: '192.168.1.15' },
  { id: 'admin-alice', role: 'ROLE_ADMIN', ip: '10.0.0.5' },
  { id: 'guest-charlie', role: 'ROLE_GUEST', ip: '203.0.113.42' }, // External IP
  { id: 'hacker-eve', role: 'ROLE_USER', ip: '198.51.100.7' } // Suspicious IP
];

// Endpoints available in the gateway
const ENDPOINTS = [
  { path: '/api/payments/process', method: 'POST' },
  { path: '/api/users/profile', method: 'GET' },
  { path: '/api/admin/dashboard', method: 'GET' },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function generateToken(user) {
  return jwt.sign(
    { sub: user.id, roles: [user.role] },
    privateKey,
    { algorithm: 'RS256', expiresIn: '1h', issuer: 'sentinel-auth', audience: 'sentinel-api' }
  );
}

async function fireRequest() {
  const user = USERS[Math.floor(Math.random() * USERS.length)];
  const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const token = generateToken(user);

  // 10% chance to send an unauthenticated request to trigger a denial
  const sendWithoutToken = Math.random() < 0.1;
  const headers = {
    'X-Forwarded-For': user.ip,
    'User-Agent': 'Sentinel-Demo-Script/1.0',
    'Content-Type': 'application/json'
  };

  if (!sendWithoutToken) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${GATEWAY_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers
    });
    
    // Consume the body to prevent memory leaks
    await res.text();
    
    const statusColor = res.status >= 200 && res.status < 300 ? '\x1b[32m' : '\x1b[31m';
    console.log(`[${new Date().toLocaleTimeString()}] ${user.ip.padEnd(15)} | ${user.id.padEnd(15)} | ${endpoint.method} ${endpoint.path.padEnd(22)} | ${statusColor}${res.status}\x1b[0m`);
  } catch (error) {
    console.log(`[${new Date().toLocaleTimeString()}] ${user.ip.padEnd(15)} | ERROR connecting to gateway: ${error.message}`);
  }
}

async function runDemo() {
  console.log("=========================================");
  console.log("🛡️  Sentinel Live Traffic Generator 🛡️");
  console.log("=========================================");
  console.log("Sending varied API traffic to Gateway (http://localhost:8080).");
  console.log("Use the Sentinel Dashboard 'Session Explorer' and 'Forensics' to view results.");
  console.log("Press Ctrl+C to stop.\n");

  while (true) {
    await fireRequest();
    // Delay between 300ms and 1500ms
    await sleep(Math.random() * 1200 + 300);
  }
}

runDemo();
