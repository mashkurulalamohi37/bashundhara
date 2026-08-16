# 🏙️ Bashundhara R/A Smart Community & Property Operating System

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start%20%2F%20Router-orange)](https://tanstack.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.12-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Container-2496ED?logo=docker)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

A next-generation, full-stack digital operating system and smart community management platform purpose-built for large-scale premium residential developments such as **Bashundhara Residential Area, Dhaka, Bangladesh**.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Key Modules & Capabilities](#-key-modules--capabilities)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Development](#-getting-started--local-development)
  - [Option A: Full-Stack Multi-Container Docker (Recommended)](#option-a-full-stack-multi-container-docker-recommended)
  - [Option B: Manual Setup (Frontend + Backend)](#option-b-manual-setup-frontend--backend)
- [API Documentation & Security](#-api-documentation--security)
- [Demo Credentials](#-demo-credentials)
- [Contributing & License](#-contributing--license)

---

## 🏛️ Architectural Overview

```
                                  SYSTEM TOPOLOGY
                                  
    ┌────────────────────────────────────────────────────────────────────────┐
    │                      CLIENT-SIDE WEB APPLICATION                       │
    │  • React 18 SPA with TanStack Start & File-Based Router                │
    │  • Tailwind CSS Design System + Radix UI Primitives                    │
    │  • Unified State Stores (FacilityStore, OpsStore, AuthService)         │
    └───────────────────────────────────┬────────────────────────────────────┘
                                        │ HTTP REST (JSON / Bearer JWT)
    ┌───────────────────────────────────▼────────────────────────────────────┐
    │                    PYTHON FASTAPI MICROSERVICE ENGINE                  │
    │  • FastAPI ASGI Microservice (Port 8000)                              │
    │  • Cryptographic Authentication (bcrypt + PyJWT)                       │
    │  • Role-Based Access Control (RBAC) Dependencies                       │
    │  • SQLAlchemy 2.0 ORM Parameterized Query Engines                      │
    └───────────────────────────────────┬────────────────────────────────────┘
                                        │ Internal Docker Network (Port 5432)
    ┌───────────────────────────────────▼────────────────────────────────────┐
    │                         POSTGRESQL 16 DATABASE                         │
    │  • Relational Schemas: Identity, Properties, Requests, Facility, GL    │
    │  • Docker Volume Persistent Storage (pgdata)                           │
    └────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Modules & Capabilities

### 1. 🏠 Resident Self-Service Portal (`/resident/*`)
* **Interactive Dashboard**: Property summary, quick action shortcuts, recent announcements, and real-time maintenance requests.
* **Emergency SOS**: One-tap high-priority SOS broadcast for Medical, Fire, Security, Gas, Electrical, and Water incidents with live response status.
* **Visitor Passes & Gate Access**: Instant 6-digit gate OTP and QR pass generator with WhatsApp and clipboard sharing integration.
* **Bills & Payments**: Service charges, utility allocations, and maintenance dues with integrated bKash, Nagad, and Card checkout flows and instant PDF receipts.
* **Universal Request Wizard**: Multi-category service request generator with live routing previews and SLA resolution.

### 2. 🎛️ Operations Control & Governance (`/control/*`)
* **Live Ops Board**: Real-time Kanban board with status columns (`new`, `assigned`, `accepted`, `in_progress`, `escalated`, `completed`), priority filtering, SLA tracking, and audit timelines.
* **Property Claims Review**: Admin approval portal for resident registration and tenancy claims with NID document inspection.
* **Caretaker Console**: Caretaker daily tasks, unit key logs, and visitor handovers.
* **Security Gate Desk**: Gate 1–8 visitor verification, OTP/QR pass scanning, and license plate logging.

### 3. 🏢 Facility Core Services (`/facility/*` - 20 Dedicated Routes)
* **Physical Asset Directory**: Comprehensive asset inventory, lifecycle depreciation, QR tag modal, and purchase valuation.
* **Work Orders & SLA Dispatch**: Auto-dispatch corrective and preventive work orders with technician tracking.
* **Preventive Maintenance (PM)**: 30-day, 90-day, and annual recurring maintenance checklists with step-by-step verification.
* **Utility Monitoring & Spikes**: Electricity, water, and gas meter readings with automated consumption spike detection.
* **Housekeeping & Sanitation**: Shift checklists and supervisor quality inspection scoring.
* **AMC Vendor Contracts**: Annual maintenance contracts, expiry alerts, renewal workflows, and security gate entry passes.
* **Biomedical & Clinic Equipment**: Community clinic medical device calibration and medical gas cylinder tracking.
* **Inventory & Spare Parts**: Maintenance tools, spare parts stock levels, Stock In/Out movements, and low stock threshold alerts.
* **Costing & General Ledger Integration**: Automatic expense posting directly to General Ledger account `5210 · Repairs & Maintenance`.
* **Live IoT Control Room**: Real-time telemetry streams for generators, lifts, ATS switches, and reservoir water levels.

### 4. 💳 Finance, General Ledger & Accounting (`/accounts/*`)
* Double-entry bookkeeping, Chart of Accounts, Journal Vouchers, General Ledger, Trial Balance, Profit & Loss, Balance Sheet, Accounts Payable, and Receivables reconciliation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TanStack Router / Start, Vite, Tailwind CSS, Radix UI Primitives, Lucide Icons, Sonner |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic V2, python-jose, passlib[bcrypt] |
| **Database** | PostgreSQL 16, SQLAlchemy 2.0 ORM |
| **Containerization** | Docker, Docker Compose (multi-stage builds) |

---

## 📁 Project Directory Structure

```
├── backend/                        # Python FastAPI Backend
│   ├── app/
│   │   ├── api/v1/endpoints/       # API route handlers (auth, identity, requests, facility)
│   │   ├── core/                   # Security, JWT, config & CORS
│   │   ├── db/                     # SQLAlchemy session & base
│   │   ├── models/                 # ORM models (identity, property, requests, facility, accounts)
│   │   ├── schemas/                # Pydantic V2 validation schemas
│   │   ├── main.py                 # FastAPI application entrypoint
│   │   └── seed.py                 # Database initialization & seed script
│   ├── Dockerfile                  # Python 3.12 Dockerfile
│   └── requirements.txt            # Python dependencies
├── src/                            # React 18 + TanStack Start Frontend
│   ├── components/                 # UI components, data tables, modals, layout headers
│   ├── hooks/                      # Custom React hooks (useAuth, useTheme, etc.)
│   ├── lib/                        # Formatting utilities, currency formatters
│   ├── routes/                     # TanStack file-based router pages (225+ routes)
│   ├── services/                   # Frontend API client & reactive stores (opsStore, facilityStore)
│   └── types/                      # TypeScript definitions (facility, ops, identity, accounting)
├── docker-compose.yml              # Multi-container orchestration (db, backend, app)
├── .env.example                    # Environment variable configuration template
├── package.json                    # Node.js dependencies & scripts
└── vite.config.ts                  # Vite & TanStack Router configuration
```

---

## 🚀 Getting Started & Local Development

### Option A: Full-Stack Multi-Container Docker (Recommended)

To run the complete ecosystem (Database + FastAPI Backend + React Web App):

```bash
# 1. Clone repository
git clone https://github.com/mashkurulalamohi37/bashundhara.git
cd bashundhara

# 2. Configure environment
cp .env.example .env

# 3. Launch all services
docker compose up --build
```

Access the services:
* **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
* **FastAPI Backend & Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **PostgreSQL Database**: `localhost:5432`

---

### Option B: Manual Setup (Frontend + Backend)

#### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (React + Vite)
```bash
# From project root:
npm install
npm run dev
```
The frontend will start at [http://localhost:5173](http://localhost:5173).

---

## 🔐 API Documentation & Security

* **Interactive OpenAPI (Swagger) UI**: Available at `/docs` when the backend is running.
* **Security Controls**:
  - Cryptographic password hashing using `bcrypt`.
  - JWT Bearer token authentication with role-based authorization guards (`super_admin`, `community_admin`, `caretaker`, `security_officer`, `resident`).
  - Automated input sanitization & parameterized queries via SQLAlchemy 2.0 (Immune to SQL injection).
  - HTTP Defensive Security Headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

---

## 🔑 Demo Credentials

| Role | Email / Identifier | Password | Access Area |
|---|---|---|---|
| **Community Admin** | `admin@bashundhara.com` | `admin123` | Control Room, Ops Board, Finance, Governance |
| **Resident** | `resident@bashundhara.com` | `resident123` | Flat Portal, SOS, Visitor Passes, Payments |
| **Caretaker** | `caretaker@bashundhara.com` | `care123` | Caretaker Daily Console, Unit Keys, Tasks |
| **Security Officer** | `security@bashundhara.com` | `sec123` | Gate Desk 1–8, Vehicle & Visitor Log |

*(One-click instant login shortcuts are also provided directly on the `/login` screen).*

---

## 📄 Contributing & License

Developed as part of the Bashundhara R/A Smart Community Management Initiative.  
All rights reserved © 2026.
