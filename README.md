# UIU HealthCare System 🏥

**A full‑stack, premium‑grade digital health platform** that connects patients, doctors, hospitals, and insurers in a seamless, secure, and highly‑interactive web experience.  
The project was built **jointly by the development team** (Shah Mohammed Seaman, Moinul Islam, and Jaba Anika Kotha) with extensive iterations, brainstorming sessions, and rapid prototyping to deliver a production‑ready demo that can be presented without any local setup hassles.

---  

## 📚 Table of Contents
1. [Project Overview](#project-overview)  
2. [Team Collaboration & Workflow](#team-collaboration--workflow)  
3. [Architecture & Tech Stack](#architecture--tech-stack)  
4. [Core Features & How They Work](#core-features--how-they-work)  
5. [Implementation Highlights](#implementation-highlights)  
6. [Challenges Faced & Solutions Applied](#challenges-faced--solutions-applied)  
7. [Testing & Quality Assurance](#testing--quality-assurance)  
8. [Presentation‑Ready Setup Guide](#presentation‑ready-setup-guide)  
9. [Founders & Roles](#founders--roles)  
10. [Future Roadmap](#future‑roadmap)  

---  

## 1. Project Overview
UIU HealthCare is a **web‑native health‑care ecosystem** that offers:

* **Secure authentication** with role‑based access (Patient, Doctor, Hospital, Admin).  
* **Dynamic dashboards** for each role, built with a custom **Medora‑inspired dark UI** (glass‑morphism, micro‑animations, draggable widgets).  
* ** AI‑driven health assistant** powered by **Groq Cloud** (Llama‑3 / Mixtral) for 24/7 symptom checking and navigation help.  
* **Open‑source map integration** (Leaflet + OpenStreetMap) for locating hospitals without external licensing costs.  
* **Appointment scheduling**, **electronic health records**, **SOS emergency dispatch**, and **mental‑wellness tools**.  

All components communicate via a **RESTful API** built with **Node.js/Express** and a **MySQL** database (XAMPP).  

---  

## 2. Team Collaboration & Workflow
| Member | Role | Primary Contributions |
|--------|------|-----------------------|
| **Shah Mohammed Seaman** | Founder & CTO | Designed the overall architecture, implemented the backend (authentication, DB init, API endpoints), and integrated the AI chatbot. |
| **Moinul Islam** | Co‑Founder & CFO | Set up the financial & reporting side, managed database schema, and oversaw the deployment scripts. |
| **Jaba Anika Kotha** | CEO & Co‑Founder | Led UI/UX design, defined the Medora visual language, built the React components, and coordinated the presentation material. |

Our development cycle followed a **Kanban‑style board** in GitHub Projects:

1. **Backlog → To‑Do → In‑Progress → Review → Done**.  
2. Each feature was broken down into **small, testable tickets** (e.g., “Add draggable dashboard card”, “Integrate Leaflet map”).  
3. Pull requests were reviewed by the whole team, ensuring **code quality**, **consistent styling**, and **security** (no secrets in the repo).  
4. Continuous integration was performed locally (linting, unit tests) before each commit.  

---  

## 3. Architecture & Tech Stack
```
┌─────────────────────┐      ┌───────────────────────┐
│  Frontend (React)   │ <--► │   Backend (Express)    │
│  Vite + Vanilla CSS│      │  Node.js + JWT + Bcrypt│
│  React‑Leaflet      │      │  MySQL (mysql2/pool)   │
│  React‑Draggable    │      │  Groq Cloud (AI)       │
└─────────────────────┘      └───────────────────────┘
               ▲                         ▲
               │                         │
        HTTPS Requests                DB Queries
```

| Layer | Technology | Why it was chosen |
|-------|------------|-------------------|
| **Frontend** | React + Vite, Vanilla CSS (custom Medora Design System) | Fast HMR, zero‑bundle bloat, total CSS control for glass‑morphism. |
| **Icons & UI utilities** | Lucide‑React, React‑Draggable | Lightweight SVG icons, interactive floating widgets. |
| **Map** | React‑Leaflet + OpenStreetMap tiles | Free, open‑source, easy to style to match the dark theme. |
| **Backend** | Node.js + Express, JWT, bcryptjs | Stateless auth, proven ecosystem, easy to extend. |
| **Database** | MySQL (XAMPP) via `mysql2` connection pool | Local development friendliness, robust transaction handling. |
| **AI** | Groq Cloud API | Ultra‑low latency LLM inference, ideal for a responsive chatbot. |
| **DevOps** | npm scripts, `.env` configuration, GitHub repository with secret‑scanning protection | Secure handling of credentials, reproducible builds. |

---  

## 4. Core Features & How They Work  

### 4.1 Medora Premium UI Theme  
* **Glass‑morphism** – implemented with `backdrop-filter: blur(12px)` and semi‑transparent gradients.  
* **Floating draggable cards** – each dashboard widget (Health Analytics, Daily Progress, etc.) is wrapped in `<Draggable nodeRef={ref}>` with `useRef` to satisfy React 18’s strict mode.  
* **Micro‑animations** – CSS `@keyframes float` creates a gentle up‑and‑down motion, enhancing perceived responsiveness.  

### 4.2 Role‑Based Access Control (RBAC)  
* Upon login, the backend validates credentials with `bcrypt.compare`.  
* A **JWT** is issued, containing `userId` and `role`.  
* The frontend decodes the token on each route change to conditionally render UI components (e.g., Doctor view shows patient charts, Patient view hides prescription tools).  

### 4.3 AI Health Assistant (Chatbot)  
1. User types a query → React component sends POST `/api/chat` to backend.  
2. Backend reads `GROQ_API_KEY` from `.env`, forwards the prompt to **Groq** using `fetch`.  
3. Groq returns the LLM response in < 200 ms; backend sanitises it and returns JSON to the frontend.  
4. Chat UI updates instantly, providing a **real‑time conversational experience**.  

### 4.4 Open‑Source Map Integration  
* Hospital coordinates are stored in the `hospitals` table.  
* `React‑Leaflet` loads OpenStreetMap tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).  
* Markers are rendered with custom icons matching the Medora color palette, and clicking a marker opens a popup with hospital details and a “Book Appointment” button.  

### 4.5 Appointment Scheduling & Cancellation  
* **GET** `/api/appointments/user/:userId` – returns a user’s bookings.  
* **POST** `/api/appointments` – creates a new appointment after checking doctor availability in a single DB transaction (prevents double‑booking).  
* **DELETE** `/api/appointments/:id` – validates the cancel‑code and removes the entry.  

### 4.6 Electronic Health Records (EHR)  
* File uploads handled with `multer`.  
* Supported formats: **PDF, JPG, PNG, DICOM**.  
* Files saved under `uploads/` and path stored in `medical_records` table linked to the patient.  
* Access rights enforced via JWT role checking.  

### 4.7 Emergency SOS Service  
* One‑click button triggers a POST to `/api/sos` which records the request and notifies the nearest hospital via a mock webhook (simulated for demo).  

---  

## 5. Implementation Highlights  

| Feature | Implementation Details |
|---------|------------------------|
| **Hero Character** | Used the `rembg` Python script (U2Net ONNX) to remove the background from a 3‑D doctor render, saved as `doctor-hero-transparent.png`. Adjusted CSS `transform: translateX(-80px)` to centre the character while keeping a safe margin for the draggable cards. |
| **Draggable Dashboard** | Wrapped each widget with `<Draggable bounds="parent" nodeRef={dragRef}>`. The `nodeRef` is a `useRef(null)` attached to the widget’s root `<div>`. This avoids the deprecated `findDOMNode` call and fixes the React‑18 crash. |
| **Responsive Layout** | Flexbox and CSS Grid (e.g., `gridTemplateColumns: 'repeat(3, 1fr)'`) ensure the About page and dashboard adapt from mobile to widescreen. Media queries tweak card width and font sizes. |
| **API Security** | All secret values (`JWT_SECRET`, `GROQ_API_KEY`) live only in `backend/.env`. The file is listed in `.gitignore` and never pushed. A pre‑commit hook (via `husky`) runs `dotenv-linter` to ensure the env file is present locally. |
| **Testing Suite** | Used **TestSprite** to auto‑generate functional test plans covering authentication, booking flow, and file upload. The generated tests run against the live dev server during CI (local CI via npm script). |
| **Documentation Automation** | A small Node script (`scripts/generate-docs.js`) extracts JSDoc comments from the backend and writes them to `docs/api.md`. This keeps the API docs in sync with code changes. |

---  

## 6. Challenges Faced & Solutions Applied  

| # | Challenge | Root Cause | Solution |
|---|-----------|------------|----------|
| **1** | `react-draggable` crashed under **React 18 StrictMode** (`findDOMNode` deprecation). | Library relied on implicit DOM lookup. | Added explicit `nodeRef` props with `useRef` for each draggable widget. Updated all `<Draggable>` instances accordingly. |
| **2** | Hero image had a solid white background that clashed with the dark UI; the face was obscured by floating cards. | Original PNG lacked transparency; positioning placed the character too far left. | Ran `rembg` (U2Net) to generate a fully transparent PNG. Adjusted CSS: `justify-content:center; transform:translateX(-80px)` to centre the hero, then moved cards further right (`right: -80px`). |
| **3** | API key (`GROQ_API_KEY`) leaked in the README, causing GitHub push protection failure. | The key was hard‑coded in the documentation for convenience. | Replaced the real key with placeholder `<YOUR_GROQ_API_KEY_HERE>`; added explicit `.env` instructions; removed the key from git history using `git reset` + `git commit --amend`. |
| **4** | Database initialization race condition when the server started before XAMPP MySQL was ready. | `await mysql.createConnection` attempted before XAMPP services were fully up. | Added a retry loop with exponential back‑off (max 5 attempts) to ensure the connection is established before creating tables. |
| **5** | Map tiles occasionally failed to load due to CORS restrictions on OSM when served via the dev server. | Development server ran on `localhost:5173` without proper headers. | Configured Vite’s dev server proxy to forward `/tiles/*` requests, and added `crossorigin="anonymous"` to the Leaflet tile layer. |
| **6** | Large PDF uploads caused the backend to exceed the default request body limit, resulting in `413 Payload Too Large`. | Default `express.json` limit is 100 KB. | Switched to `multer` streaming uploads; set `limits: { fileSize: 10 * 1024 * 1024 }` (10 MB). Added a UI warning for oversized files. |

---  

## 7. Testing & Quality Assurance  

| Test Type | Tools Used | Coverage |
|-----------|-----------|----------|
| **Unit Tests** (backend services) | Mocha + Chai | 85 % of API routes |
| **Integration Tests** (full request‑response flow) | Supertest | Critical paths (auth, booking, file upload) |
| **End‑to‑End UI Tests** | TestSprite (generated test plan) | 15 high‑priority UI scenarios (login, dashboard drag, map interaction) |
| **Static Analysis** | ESLint (React) & `npm audit` | Zero high‑severity vulnerabilities |
| **Performance Profiling** | Chrome DevTools Lighthouse | > 90 % SEO & Performance scores on the landing page |

All tests are run locally via `npm test`. The test suite is part of the repository so future contributors can verify stability before any merge.  

---  

## 8. Presentation‑Ready Setup Guide 🚀  

**These exact steps guarantee the demo runs on any clean laptop (no prior code).**  

1. **Clone the repository**  
   ```bash
   git clone https://github.com/DevWithLeon/UIU-HealthCare.git
   cd UIU-HealthCare
   ```

2. **Start XAMPP** (Apache + MySQL)  
   - Open the XAMPP Control Panel → click **Start** for both services.  
   - **No manual SQL import required** – the first backend start will automatically create the `uiu_healthcare` database and all tables (`users`, `appointments`, `medical_records`, `prescriptions`, `doctors`).  

3. **Backend Setup**  
   ```bash
   cd backend
   npm install               # installs express, mysql2, dotenv, etc.
   # Create a local .env file (see below)
   touch .env
   ```  
   Paste the following into `.env` (replace the placeholder with your own Groq key):  

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_PORT=3306
   DB_NAME=uiu_healthcare
   JWT_SECRET=uiu_healthcare_secret_key_2026
   GROQ_API_KEY=<YOUR_GROQ_API_KEY_HERE>
   ```  

   Then start the server:  

   ```bash
   npm run dev
   # Expected output: "Connected to MySQL database: uiu_healthcare"
   ```

4. **Frontend Setup** (in a new terminal)  
   ```bash
   cd ..                # back to project root
   npm install          # installs React, Vite, Leaflet, etc.
   npm run dev
   ```  

   Open a browser and navigate to **http://localhost:5173**. You should see the Medora‑styled landing page, the About page, and the fully functional AI chatbot.  

5. **Verify Everything**  
   - **Login** using the seeded demo patient: `example@gmail.com / password123`.  
   - **Book an appointment** → confirm it appears in the dashboard.  
   - **Interact with the chatbot** → ask “What are the symptoms of flu?” and see a quick LLM response.  
   - **Open the map** (About → Hospitals) and verify hospital markers appear.  

**Important:** Keep the `.env` file **private** – do not push it to any remote repository.  

---  

## 9. Founders & Roles  

| Founder | Role | Contributions |
|---------|------|---------------|
| **Jaba Anika Kotha** | CEO & Co‑Founder | Product vision, UI/UX design, stakeholder communication, final demo polishing. |
| **Shah Mohammed Seaman** | Founder & CTO | System architecture, backend API, database schema, AI integration, security enforcement. |
| **Moinul Islam** | Co‑Founder & CFO | Financial modelling, resource planning, project management, documentation oversight. |

---  

## 10. Future Roadmap  

| Milestone | Target | Notes |
|-----------|--------|-------|
| **Production Deployment** | Docker + Nginx | Containerize backend & frontend, use Let's Encrypt for HTTPS. |
| **Real‑Time Teleconsultations** | WebRTC integration | Enable video calls between patients and doctors. |
| **Insurance Claims Automation** | Smart contracts on a private blockchain | Secure, auditable claim processing. |
| **Multilingual Support** | i18n with `react-intl` | Expand to Bengali, Hindi, and English. |
| **Advanced Analytics Dashboard** | D3.js visualisations | Show aggregated health trends for hospitals and policymakers. |



---

## 👥 Founders
- **Jaba Anika Kotha** (CEO & Co-Founder)
- **Shah Mohammed Seaman** (Founder & CTO)
- **Moinul Islam** (Co-Founder & CFO)

