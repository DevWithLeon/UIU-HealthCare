# UIU HealthCare System 🏥

A comprehensive, full-stack digital healthcare ecosystem designed to seamlessly connect Patients, Doctors, and Hospitals. Built for the modern web with a focus on premium UI/UX, AI-driven insights, and secure medical data management.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Interface:** React.js, Vite, Vanilla CSS (Custom Medora Design System)
- **UI Components:** Lucide-React (Iconography), React-Draggable (Interactive widgets), React-Leaflet (Open Source Maps)
- **Backend Server:** Node.js, Express.js
- **Database:** MySQL (Powered by XAMPP, with Connection Pooling via `mysql2`)
- **Security:** JSON Web Tokens (JWT) for stateless sessions, bcryptjs for password hashing.
- **AI Engine:** Groq Cloud API (Running ultra-fast Llama-3/Mixtral LLMs for the chatbot)

---

## ✨ Core Features & Technical Deep Dive

### 1. The Medora Premium UI System
We moved away from generic UI frameworks to build a completely custom design system heavily inspired by the "Medora" aesthetic. 
- **How it works:** We utilized advanced CSS features like `backdrop-filter: blur(12px)` for glassmorphism, radial gradient masking for organic imagery blending, and CSS keyframe animations for floating elements. 

### 2. Intelligent AI Chatbot Assistant
A 24/7 virtual assistant capable of providing preliminary symptom checking and platform navigation help.
- **How we built it:** To keep API keys secure, the frontend never talks to the AI directly. Instead, React sends the user's message to our Express backend. The backend securely attaches the `GROQ_API_KEY` and forwards the prompt to Groq's high-speed inference engine. The response is parsed and sent back to the user's chat window in milliseconds.

### 3. Open Source Map Integration
To help patients locate nearby hospitals and clinics without incurring expensive Google Maps API costs, we integrated open-source mapping.
- **How we built it:** We used `Leaflet.js` wrapped in `React-Leaflet`. The map pulls free map tiles from OpenStreetMap (OSM). We plot interactive markers using the latitude and longitude coordinates of our registered hospitals directly from our MySQL database.

### 4. Role-Based Access Control (RBAC)
The platform behaves differently depending on who logs in.
- **How it works:** Upon login, the backend verifies the encrypted password using `bcrypt.compare()`. If successful, it generates a JWT containing the user's `role` (Patient, Doctor, Hospital, Admin). The React frontend decodes this JWT and dynamically changes the routing (e.g., hiding the "Prescribe Medication" button from Patients, but showing it to Doctors).

### 5. Electronic Health Records (EHR) & Appointments
- **How it works:** Patients can upload PDFs or images of lab reports. The backend handles `multipart/form-data` parsing, validates the file extension, and saves the file path to the MySQL `medical_records` table, linking it via a foreign key to the `user_id`. Appointments are managed using a transactional SQL model to prevent double-booking.

---

## 🐛 Technical Challenges & Solutions

Building a complex system led to several technical hurdles. Here is how we solved them:

**1. The `react-draggable` Crash in React 18**
* **Error:** When trying to make the dashboard glass cards draggable, the app completely crashed in development mode with `findDOMNode is deprecated in StrictMode`.
* **Solution:** React 18 no longer allows libraries to implicitly search for DOM nodes. We solved this by creating strict `useRef` hooks (e.g., `const dragRef1 = useRef(null)`) and binding them explicitly via the `nodeRef` prop inside the `<Draggable>` wrapper.

**2. Hero Image Background Clashing**
* **Error:** The main doctor character image had a solid white background that ruined the dark-mode Medora aesthetic, and overlapping floating cards obscured her face.
* **Solution:** We bypassed basic CSS tricks and utilized a Python-based Machine Learning tool (`rembg` powered by the U2Net ONNX model) to programmatically extract the character and generate a perfect transparent `.png`. We then used flexbox alignments and CSS `translateX` to re-anchor the image to the center, creating safe zones for the floating widgets.

**3. API Key Security & GitHub Push Rejection**
* **Error:** During a commit, GitHub forcefully blocked our `git push` due to a "Secret Scanning Rule Violation".
* **Solution:** We realized the `GROQ_API_KEY` was exposed in the README. We implemented industry-standard environment variable practices. We created a `.env` file for local development, added `.env` to our `.gitignore`, and used `git commit --amend` to completely scrub the secret from the git commit history.

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

## 👥 Founders
- **Jaba Anika Kotha** (CEO & Co-Founder)
- **Shah Mohammed Seaman** (Founder & CTO)
- **Moinul Islam** (Co-Founder & CFO)
