# 🌱 AgriTech — Empowering Farmers Through Digital Technology

> **SkillWallet MERN Full Stack Development Capstone Project**  
> A complete, production-grade agricultural management web platform engineered to empower Indian farmers with digital crop tracking, soil health diagnostics, real-time agro-meteorological forecasting, an agricultural resource marketplace, peer community forums, verified expert consultations, and explainable machine learning crop intelligence.

---

## 📑 Table of Contents
1. [Architecture & System Design](#-architecture--system-design)
2. [Mandatory Technology Stack](#-mandatory-technology-stack)
3. [Required Modules Implementation](#-required-modules-implementation)
4. [Unique Features](#-unique-features)
5. [Demo User Credentials](#-demo-user-credentials)
6. [Local Setup & Execution Guide](#-local-setup--execution-guide)
7. [REST API Endpoints Reference](#-rest-api-endpoints-reference)
8. [Automated Test Suite](#-automated-test-suite)
9. [Zero-Cost External Services & Deployment Guide](#-zero-cost-external-services--deployment-guide)

---

## 🏛 Architecture & System Design

flowchart TD
    subgraph CLIENT["Frontend - React and Bootstrap"]
        UI["Farmer and Admin UI"]
        LANG["Language Context"]
        AUTH["Authentication Context"]
        ROUTER["React Router"]
        UI --> ROUTER --> AUTH --> LANG
    end

    subgraph SERVER["Backend - Node.js and Express"]
        API["REST API Gateway"]
        JWT["JWT Authentication and RBAC"]
        VALIDATE["Input Validation"]
        AUTHCTRL["Authentication and Profile"]
        FARM["Farm and Crop Management"]
        SOIL["Soil Diagnostics"]
        WEATHER["Weather and Pest Risk"]
        MARKET["Resources and Orders"]
        FORUM["Community and Consultations"]
        ADMIN["Admin Controls"]
        ML["ML Recommendation Engine"]
        AI["Hindi Kisan AI Assistant"]

        API --> JWT --> VALIDATE
        VALIDATE --> AUTHCTRL
        VALIDATE --> FARM
        VALIDATE --> SOIL
        VALIDATE --> WEATHER
        VALIDATE --> MARKET
        VALIDATE --> FORUM
        VALIDATE --> ADMIN
        VALIDATE --> ML
        VALIDATE --> AI
    end

    subgraph DATA["Database and External Services"]
        DB[("MongoDB Atlas")]
        WEATHERAPI["Open-Meteo API"]
        DATASET["Crop Dataset and ML Model"]
        KB["Agriculture Knowledge Base"]
    end

    AUTH --> API
    AUTHCTRL --> DB
    FARM --> DB
    SOIL --> DB
    MARKET --> DB
    FORUM --> DB
    ADMIN --> DB
    WEATHER --> WEATHERAPI
    ML --> DATASET
    AI --> KB

---

## 💻 Mandatory Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (v18), JavaScript (ES6+) | Component-driven responsive user interface |
| **Styling & UI** | Bootstrap 5, Bootstrap Icons | Mobile-first rural-friendly styling & crisp iconography |
| **Client Routing** | React Router DOM (v6) | Protected routing, role-based access control |
| **HTTP Client** | Axios | Configured with automatic JWT bearer token interceptors |
| **Backend** | Node.js (v24 LTS), Express.js | Production RESTful API architecture |
| **Database** | MongoDB & Mongoose (v8) | Persistent schema-based database storage |
| **Authentication** | JWT (jsonwebtoken) & bcryptjs | 7-day secure token authentication and salted password hashing |
| **Validation** | express-validator | Strict request sanitization, data validation & error handling |
| **Machine Learning**| Scikit-learn & Node.js Engine | Multiclass probabilistic model trained on Kaggle crop dataset |
| **Agro-Weather** | Open-Meteo API | 100% free, real-time atmospheric data (0 cost, no key needed) |

---

## 📦 Required Modules Implementation

1. **Farmer Registration, Login & Profile Management**:
   - Secure registration with mobile number, village, district, state, and language preference.
   - Profile management with password updates and farm summaries.
2. **Farm Creation & Management**:
   - Multi-plot creation with acreage, soil classification (Alluvial, Black, Red, Sandy Loam, Clay Loam), and irrigation source (Borewell, Canal, Drip, Sprinkler, Rainfed).
   - Strict farmer entity ownership and authorization.
3. **Crop Records & Soil-Health Analysis**:
   - Crop cycle tracker from sowing to harvest.
   - Comprehensive soil health test logging (N, P, K, pH, Organic Carbon, Electrical Conductivity).
   - Algorithmic diagnostic engine rating fertility and generating corrective fertilizer prescriptions (Urea, DAP, MOP, Lime/Gypsum).
4. **Weather Forecasting & Pest Alerts**:
   - Live atmospheric conditions (temp, feels like, humidity, rain chance, wind speed) via Open-Meteo API.
   - 7-day agro-meteorological outlook.
   - Dynamic pest risk detection (e.g. fungal blight warning during warm humid spells).
5. **Agricultural Resource Catalogue, Orders & Tracking**:
   - Marketplace of certified seeds, fertilizers, bio-pesticides, and irrigation tools.
   - Cart management, delivery address checkout, Cash on Delivery / Kisan Credit Demo payment.
   - 4-stage tracking timeline (Placed -> Confirmed -> Dispatched -> Delivered) with inventory deduction.
6. **Expert Consultation & Community Forums**:
   - Peer discussion forum (चौपाल) with category filters, upvoting, and comments.
   - "Ask an Agronomist" consultation module where verified ICAR/PAU experts provide diagnostic prescriptions.
7. **Administrator Dashboard & Content Management**:
   - Aggregate platform analytics (total farmers, active farms, crops sown, revenue, open consultations).
   - User control center (role promotions, expert verification badges, deletion).
   - Order fulfillment workflow and regional emergency alert broadcast tool.
8. **Responsive UI with English & Hindi Support**:
   - One-click language switcher toggling full English and Hindi (Devanagari) dictionaries.
   - Mobile-first responsive layouts tailored for farmers on smartphones.
9. **REST API Validation, Error Handling & Testing**:
   - Centralized Mongoose error handler (CastError, Duplicate Key, ValidationError, JWT expiration).
   - Automated test suite (`node --test tests/api.test.js`) verifying 11 endpoint suites with 100% pass rate.
10. **Deployment Documentation & GitHub-Ready Repository**:
    - Clean `.env.example`, `.gitignore`, root scripts, and complete setup instructions.

---

## ⭐ Unique Features

### 1. Explainable ML Crop Recommendation Engine
- **Documented Dataset**: Kaggle Agricultural Crop Recommendation Dataset (2,200 empirical rows across 22 crops evaluating N, P, K, pH, rainfall, temperature, and humidity).
- **Explainability Breakdown**:
  - Predicts top recommended crop with confidence probability score.
  - Generates parameter-by-parameter match bars showing how the farmer's soil and climate align with the crop's agronomic comfort zone.
  - **Limiting Factor Analysis**: Pinpoints the exact constraint limiting yield (e.g., *"Phosphorus is 18 kg/ha, which is below ideal target of 48 kg/ha. Amending with DAP can raise yield potential by 24%"*).
  - Lists top 3 runner-up alternative crops.

### 2. Personalized Crop Activity Timeline
- Sowing-to-harvest dynamic timeline automatically calculated per crop variety and sowing date.
- Formulates exact Days After Sowing (DAS) for critical stages (e.g., Crown Root Initiation for Wheat, Active Tillering for Paddy, Flowering Guard).
- Farmers can tick tasks off, log completed dates, and add custom notes.

### 3. Hindi Agricultural Assistant ("किसान साथी" / Kisan Saathi)
- Conversational assistant grounded in ICAR, Krishi Vigyan Kendra, and national package of practices.
- Answers queries in Hindi (Devanagari) and English regarding PM-Kisan schemes, organic pest control (Neem oil, Dashparni Ark), and fertilizer application.
- Self-contained offline knowledge base (100% free and reliable) with optional Google Gemini API support.

---

## 🔑 Demo User Credentials

For quick evaluation, pre-seeded accounts are provided with realistic agricultural data:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@agritech.com` | `Farmer@123` | Gurpreet Singh (Ludhiana, Punjab) — 2 Farms, active Wheat & Mustard plots |
| **Agronomist** | `expert@agritech.com` | `Expert@123` | Dr. Ramesh Sharma — Senior Agronomist (PAU / ICAR Verified Expert) |
| **Administrator** | `admin@agritech.com` | `Admin@123` | AgriTech Master Admin — Platform Governance & Broadcast Control |

> [!TIP]
> On the Login page, you can click any of the 3 **Quick Demo Credentials** buttons to auto-fill these accounts with a single click.

---

## 🚀 Local Setup & Execution Guide

### Prerequisites
- **Node.js**: v20 or higher (v24 LTS recommended)
- **Git**
- **MongoDB**: Compatible with local MongoDB, MongoDB Atlas free tier, or the built-in in-memory MongoDB engine.

### Step 1: Clone Repository & Configure Environment
```bash
git clone <your-repo-url>
cd AgriTech

# Configure Backend Environment
cp backend/.env.example backend/.env
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 3: Seed Demo Database
```bash
cd backend
npm run seed
cd ..
```

### Step 4: Run Application
#### Option A: Run Full-Stack from Backend (Recommended)
```bash
# Build frontend once
cd frontend
npm run build
cd ..

# Start backend (serves both API on /api and Frontend on port 5000)
cd backend
npm start
```
Open **`http://localhost:5000`** in your browser.

#### Option B: Run in Development Mode (Concurrent Vite + Express)
- Terminal 1 (Backend):
  ```bash
  cd backend
  npm run dev
  ```
- Terminal 2 (Frontend):
  ```bash
  cd frontend
  npm run dev
  ```
Open **`http://localhost:3000`** in your browser.

---

## 🧪 Automated Test Suite

AgriTech includes an automated REST API integration test suite covering authentication, farm CRUD, crop timeline generation, soil diagnostics, and AI endpoints.

To run the automated tests:
```bash
cd backend
npm test
```

### Test Suite Execution Output:
```text
▶ 1. System Health & Gateway Verification
  ✔ GET /api/health returns 200 and operational status
▶ 2. Farmer Registration & Authentication Flow
  ✔ POST /api/auth/register creates farmer account and returns JWT
  ✔ POST /api/auth/login authenticates farmer with valid password
  ✔ POST /api/auth/login rejects incorrect password
▶ 3. Farm & Plot Management CRUD
  ✔ POST /api/farms creates a new farm record for authenticated farmer
  ✔ GET /api/farms retrieves all registered farms of farmer
▶ 4. Crop Records & Personalized Timeline Generation
  ✔ POST /api/crops automatically creates crop with stage-by-stage timeline
  ✔ PUT /api/crops/:id/activity/:activityId updates activity completion
▶ 5. Soil Health Analysis & Diagnostics
  ✔ POST /api/soil evaluates NPK, pH and returns recommendations
▶ 6. Unique Feature: Explainable ML Crop Recommendation
  ✔ POST /api/ai/recommend-crop computes top crop with confidence and feature explanation
▶ 7. Unique Feature: Hindi Agricultural Assistant (Kisan Saathi)
  ✔ POST /api/ai/kisan-saathi returns grounded advisory in Hindi

ℹ tests 11 | pass 11 | fail 0
```

---

## 🌐 REST API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new user (farmer/expert)
- `POST /api/auth/login`: Authenticate and receive JWT
- `GET  /api/auth/profile`: Get logged-in user profile (Protected)
- `PUT  /api/auth/profile`: Update profile information (Protected)
- `PUT  /api/auth/change-password`: Change account password (Protected)

### Farms & Crops (`/api/farms`, `/api/crops`)
- `GET    /api/farms`: List farmer's farms
- `POST   /api/farms`: Register a new farm plot
- `GET    /api/farms/:id`: Get farm details with associated crops & soil tests
- `PUT    /api/farms/:id`: Update farm details
- `DELETE /api/farms/:id`: Delete farm and cascade records
- `GET    /api/crops`: List crops with timeline
- `POST   /api/crops`: Sows crop and initializes personalized activity calendar
- `PUT    /api/crops/:id/activity/:activityId`: Mark timeline activity complete/undone

### Soil Diagnostics (`/api/soil`)
- `GET  /api/soil`: List soil health test history
- `POST /api/soil`: Record soil test (auto-analyzes NPK/pH & generates recommendations)
- `DELETE /api/soil/:id`: Delete soil record

### Agro-Weather (`/api/weather`)
- `GET  /api/weather/forecast`: Real-time weather, 7-day forecast, and pest advisories
- `GET  /api/weather/alerts`: Regional active weather/pest alerts
- `POST /api/weather/alerts`: Broadcast regional alert (Admin/Expert only)

### Marketplace & Orders (`/api/resources`, `/api/orders`)
- `GET  /api/resources`: Browse agricultural resource catalogue
- `POST /api/resources`: Add resource to catalogue (Admin only)
- `GET  /api/orders`: List farmer's orders
- `POST /api/orders`: Place new order with inventory deduction
- `PUT  /api/orders/:id/status`: Advance order tracking status (Admin only)
- `PUT  /api/orders/:id/cancel`: Cancel placed order

### Community & Advisory (`/api/forum`, `/api/consultations`)
- `GET  /api/forum`: Browse community questions and discussions
- `POST /api/forum`: Post community discussion
- `PUT  /api/forum/:id/upvote`: Upvote/downvote post
- `POST /api/forum/:id/reply`: Add reply (verified expert badge supported)
- `GET  /api/consultations`: List agronomic inquiries
- `POST /api/consultations`: Submit expert consultation query
- `PUT  /api/consultations/:id/prescribe`: Submit expert diagnosis & prescription

### AI & Machine Learning (`/api/ai`)
- `POST /api/ai/recommend-crop`: Explainable ML crop recommendation with limiting factor analysis
- `POST /api/ai/kisan-saathi`: Hindi Agricultural Assistant grounded advisory query

---

## 💰 Zero-Cost External Services & Deployment Guide

The application is engineered to operate on **\$0.00** infrastructure cost:
1. **Weather Feed**: Powered by Open-Meteo, which requires no API keys and has zero subscription fees.
2. **Database**: Fully compatible with **MongoDB Atlas Free M0 Sandbox** (512 MB free persistent storage).
3. **Deployment**:
   - **Backend**: Can be deployed to Render.com, Railway.app, or Fly.io free tiers.
   - **Frontend**: Can be served directly by Express or hosted on Vercel / Netlify.
