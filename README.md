# UIU HealthCare System

A full-stack, MySQL-backed digital healthcare platform designed for the Bangladeshi market. It features a modern React (Vite) frontend and a Node.js/Express.js backend utilizing connection pooling for MySQL (fully compatible with local XAMPP).

## Core Modules & Features

- **User Authentication**: Role-based signup and login (Patient, Doctor, Hospital, Admin) using JWT and bcrypt hashing. The backend automatically seeds a default test patient (`example@gmail.com` / `password123`) on start.
- **Verification Page**: Verification step with mock OTP validation code (`123456`).
- **Dashboard Interfaces**: Tailored Patient, Doctor, Hospital, and Admin dashboards.
- **Appointment Scheduling**: Search, view, and book appointments with verified doctors. Support for cancellation by unique reference code with validation checks.
- **Electronic Health Records**: Secure uploading and storage of lab reports and medical history. Restricts file uploads to supported formats (PDF, JPG, PNG, and DICOM) with error feedback.
- **AI Health Assistant**: 24/7 AI chatbot for symptom checking and healthcare guidance.
- **Mental Wellness**: Built-in self-assessment tests, breathing tools, and guides.
- **Emergency SOS Services**: Instant request dispatching.
- **Testing & Simulation**: Includes controls like a "Simulate Empty" doctor discovery button to test empty-state UI handling.

## Tech Stack

- **Frontend**: React.js, Axios, Lucide React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js, JWT, bcryptjs, mysql2 (Connection Pool)
- **Database**: MySQL (XAMPP local host)

---

## Getting Started

### 1. Database Setup (XAMPP MySQL)
1. Start XAMPP (Apache and MySQL services):
   ```bash
   sudo /opt/lampp/lampp start
   ```
2. The backend server automatically initializes the `uiu_healthcare` database and creates the necessary tables (`users`, `appointments`, `medical_records`, `prescriptions`, `doctors`) on its first run.
3. Access phpMyAdmin at: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)

### 2. Install & Start Backend
1. Go to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env` or set environment variables:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   JWT_SECRET=uiu_healthcare_secret_key_2026
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Install & Start Frontend
1. Go to the main project folder:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the site in your browser at: [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate user and issue token.

### Appointments
- `GET /api/appointments/user/:userId` - Get all appointments for a user.
- `POST /api/appointments` - Book a new appointment.
- `DELETE /api/appointments/:id` - Cancel an appointment.

### Health Records
- `GET /api/records/:userId` - Get medical records for a patient.
- `POST /api/records` - Add a new medical record.

### Doctors
- `GET /api/doctors` - Retrieve list of verified doctors.

---

## Authors
- Shah Mohammed Seaman
- Moinul Islam
