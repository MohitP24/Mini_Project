# 🛡️ Sentinel — Event-Sourced Replayable API Gateway

Sentinel is a high-performance, security-focused API Gateway built with **Java 21**, **Spring Boot 3.2**, and **PostgreSQL**. Unlike traditional gateways, Sentinel uses **Event Sourcing** to record every incoming request and outgoing response, allowing for complete auditability, forensic analysis, and traffic replay.

---

## 🚀 Key Features

*   **Event-Sourced Architecture**: Every interaction is persisted as a sequence of immutable events.
*   **Intelligent Risk Scoring**: Built-in risk engine evaluates requests based on IP reputation, request rate, and JWT anomalies.
*   **Policy-Driven Access**: Granular control over API traffic using a dynamic policy engine.
*   **Forensics & Auditing**: Dedicated API and Dashboard for analyzing traffic patterns and security incidents.
*   **Traffic Replay**: Ability to replay historical traffic for debugging or testing purposes.
*   **Microservices Orchestration**: Seamlessly routes traffic to multiple backend services with built-in mock services for rapid development.

---

## 🏗️ Project Structure

| Module | Description |
| :--- | :--- |
| `sentinel-gateway` | The main entry point. Handles routing, security, and event persistence. |
| `sentinel-admin-api` | Management API for policies, service configurations, and system health. |
| `sentinel-forensics-api` | Analytical API for querying event logs and security findings. |
| `sentinel-dashboard` | A modern React + TypeScript dashboard for visualization and management. |
| `sentinel-common` | Shared models, utilities, and security configurations. |
| `mock-services` | Lightweight backend services (Payment, User, Admin) for testing. |

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Java 21 SDK](https://adoptium.net/temurin/releases/?version=21) (if running locally)
- [Node.js 18+](https://nodejs.org/) (for the Dashboard)
- [Maven 3.9+](https://maven.apache.org/) (if building locally)

---

## 🏁 Getting Started

### 1. Environment Configuration
Sentinel uses environment variables for configuration. A template is provided in `.env.example`.

```bash
# Copy the example environment file
cp .env.example .env
```
Edit the `.env` file and set secure passwords and keys.

### 2. Security Setup (JWT Keys)
Sentinel uses RS256 for JWT signing. You need to generate a pair of RSA keys.

```bash
# Use the provided script to generate keys
chmod +x scripts/keygen/generate_rsa_keys.sh
./scripts/keygen/generate_rsa_keys.sh
```
This will generate `sentinel_private_key.pem` and `sentinel_public_key.pem` in the `secrets` directory.

### 3. Build and Run (Docker)
The easiest way to run the entire Sentinel stack is using Docker Compose.

```bash
# Build and start all services
docker-compose up --build
```

---

## 📊 Service Endpoints

Once the services are up, you can access them at the following addresses:

| Service | Port | Description |
| :--- | :--- | :--- |
| **Gateway** | `8080` | Main traffic entry point |
| **Forensics API** | `8082` | Security & Event Analysis |
| **Admin API** | `8083` | Management & Policies |
| **Mock Payment** | `9001` | Test Payment Service |
| **Mock User** | `9002` | Test User Service |
| **Mock Admin** | `9003` | Test Admin Service |

### 🖥️ Running the Dashboard
The dashboard is currently run separately from the Docker stack:

```bash
cd sentinel-dashboard
npm install
npm run dev
```
Access the dashboard at `http://localhost:3000` (or the port specified in `.env`).

---

## 🛠️ Local Development (Maven)
If you wish to run services individually without Docker:

```bash
# Build all modules
./mvnw clean install

# Run the Gateway
cd sentinel-gateway
../mvnw spring-boot:run
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
