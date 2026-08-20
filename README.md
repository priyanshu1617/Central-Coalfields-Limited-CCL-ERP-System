# Central Coalfields Limited (CCL) ERP System

Build a full-stack, production-quality Enterprise Resource Planning (ERP) web application inspired by Central Coalfields Limited (CCL), a subsidiary of Coal India Limited. The system manages mine status, coal extraction logging, fleet vehicles, store catalog levels, purchases approvals, accounts bookkeeping, and HR payroll, following an enterprise-grade responsive layout matching industrial software interfaces.

**🔗 Live Demo:** [central-coalfields-limited-ccl-erp-seven.vercel.app](https://central-coalfields-limited-ccl-erp-seven.vercel.app/)

---

## 🚀 Key Features

*   **SAP & Oracle ERP Styled Dashboard**: Counters tracking tonnes mined daily, active workers, running machines, safety metrics, and area chart trends.
*   **Role-Based Access Control**: Standard privileges configured for `Admin`, `HR`, `Mine Manager`, `Production Manager`, `Finance Manager`, `Inventory Manager`, `Safety Officer`, and `Employee`.
*   **Unified HR Directory**: Profile registrations, timelines, emergency contact cards, and service records.
*   **Gate Punches & Calendar**: Punch cards with shift slots (General, Morning, Evening, Night) and monthly logs tracking overtime.
*   **Mine Pits Target Management**: Monitor extraction achievements against target limits and allocate supervisors.
*   **Heavy Machinery & Vehicle Fleet**: Tracking running hours, next maintenance dates, fuel logs, and drivers.
*   **Supplier Stores & Procurements**: Catelog reserves (ANFO explosives, lubricants, fuels) with reorder warning metrics and procurement approval pipelines.
*   **Logistics Dispatches**: Truck dispatches log binding gate passes, invoice records, and customer delivery points.
*   **Bookkeeping & Salary Payouts**: P&L accounting sheet tracking revenues and expenses by mine cost centers, and HTML printable payslip invoices.
*   **Circulars Board & Exporter**: Announcement publishing desk and reports exporter supporting browser CSV compilation downloads.

---

## 🛠️ Technology Stack

*   **Frontend**: React 19, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React Icons
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt, Multer, Helmet, CORS, Morgan
*   **Orchestration**: Concurrently for running client & server together

---

## 📂 Architecture

```text
/ccl-erp
  ├── /client                 # React Frontend
  │     ├── /src
  │     │     ├── /components # Reusable UI (Card, Button)
  │     │     ├── /layouts    # Sidebar & Topbar Grid
  │     │     ├── /context    # Theme, Session, Notices Contexts
  │     │     ├── /services   # Axios REST endpoints
  │     │     ├── /pages      # Individual ERP Modules
  │     │     └── /routes     # Protected Route Guard
  └── /server                 # Express Backend API
        ├── /config           # Database Connector
        ├── /middleware       # JWT Verification, Uploads
        ├── /models           # Mongoose schemas
        ├── /controllers      # REST Controllers
        └── /utils            # Mock Seeder & DB helper
```

---

## 📦 Setting Up Locally

### 1. Prerequisite Installations
*   Ensure Node.js (version 18 or above) is installed.

### 2. Install Dependencies
Run the command below in the project root (`/ccl-erp`) to install all root, client, and server dependencies concurrently:
```bash
npm run install:all
```

### 3. Launch Servers Concurrently
Start both backend API server and Vite client concurrently with:
```bash
npm run dev
```
*   **Backend URL**: `http://localhost:5000`
*   **Frontend URL**: `http://localhost:5173`

---

## 📊 Database Configurations (MongoDB Atlas / JSON Fallback)

To provide an instant out-of-the-box experience:
1.  **Fallback Mode**: If no `MONGODB_URI` environment variable is defined in `/server/.env`, the backend server automatically initiates a local JSON-file-based mock database inside a newly created `/server/data` directory. All CRUD actions operate exactly like a MongoDB database.
2.  **Atlas Mode**: If you have a running MongoDB Atlas database, simply add your cluster connection string inside `/server/.env`:
    ```env
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ccl_db
    ```
    On server start, Mongoose connects and populates collection records.

---

## 🔑 Demo Access Profiles
All seeded profiles use the password key: **`ccl12345`**

*   **Mine Manager Profile**:
    *   Email: `manager@ccl.gov.in`
*   **Safety Officer Profile**:
    *   Email: `safety@ccl.gov.in`
*   **HR Manager Profile**:
    *   Email: `hr@ccl.gov.in`
*   **Finance Manager Profile**:
    *   Email: `finance@ccl.gov.in`
*   **Chief General Admin Profile**:
    *   Email: `admin@ccl.gov.in`
*   **Employee/Supervisor Profile**:
    *   Email: `vikash.kumar@ccl.gov.in`

---
*For educational demo purposes only.*

