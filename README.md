# UIU HealthCare System

A full-stack, MySQL-backed digital healthcare platform designed for the Bangladeshi market. It features a modern React (Vite) frontend and a Node.js/Express.js backend utilizing connection pooling for MySQL (fully compatible with local XAMPP).

## Core Modules & Features

- **Medora Premium UI Theme**: A stunning dark-mode aesthetic featuring custom glassmorphism components, floating draggable UI cards, dynamic micro-animations, and 3D stylized character graphics.
- **Dedicated About Page**: A detailed 'About Us' page outlining the platform's vision, goals, and showcasing the founding leadership team.
- **User Authentication**: Role-based signup and login (Patient, Doctor, Hospital, Admin) using JWT and bcrypt hashing. The backend automatically seeds a default test patient (`example@gmail.com` / `password123`) on start.
- **Dashboard Interfaces**: Tailored Patient, Doctor, Hospital, and Admin dashboards.
- **Appointment Scheduling**: Search, view, and book appointments with verified doctors. Support for cancellation by unique reference code with validation checks.
- **Electronic Health Records**: Secure uploading and storage of lab reports and medical history. Restricts file uploads to supported formats (PDF, JPG, PNG, and DICOM) with error feedback.
- **AI Health Assistant**: 24/7 AI chatbot for symptom checking and healthcare guidance.

---

## 🚀 PRESENTATION SETUP GUIDE 🚀

Follow these **exact** steps to download and run the project perfectly on your presentation computer.

### Step 1: Start XAMPP (Database)
1. Open XAMPP Control Panel and click **Start** for both **Apache** and **MySQL**.
2. *Note: You do NOT need to manually import any `.sql` files or create a database in phpMyAdmin. The backend code will automatically create the `uiu_healthcare` database and all required tables the moment you start it!*

### Step 2: Set Up the Backend
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd UIU-HealthCare/backend
   ```
2. Install the required Node modules:
   ```bash
   npm install
   ```
3. **CRITICAL STEP:** Because it is a security risk to upload API keys to GitHub, your `.env` file was not downloaded. You must create it manually!
   Create a new file named exactly `.env` inside the `backend` folder.
4. Copy and paste the following code exactly into your new `.env` file and save it:
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
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *(You should see "Connected to MySQL database: uiu_healthcare" in your terminal).*

### Step 3: Set Up the Frontend
1. Open a **new** terminal (keep the backend running) and navigate to the main project folder:
   ```bash
   cd UIU-HealthCare
   ```
2. Install the frontend Node modules:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to: **[http://localhost:5173](http://localhost:5173)**

*You are now ready to present!*

---

## Tech Stack
- **Frontend**: React.js, Vite, Axios, Lucide React, react-draggable, Vanilla CSS (Medora Design System)
- **Backend**: Node.js, Express.js, JWT, bcryptjs, mysql2 (Connection Pool)
- **Database**: MySQL (XAMPP local host)

## Founders
- **Jaba Anika Kotha** (CEO & Co-Founder)
- **Shah Mohammed Seaman** (Founder & CTO)
- **Moinul Islam** (Co-Founder & CFO)
