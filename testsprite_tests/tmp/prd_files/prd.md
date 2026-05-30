UIU HealthCare
Product Requirements Document


AI-Powered Healthcare Management Platform
Telemedicine · EHR · E-Pharmacy · Mental Wellness · Emergency Services

Version
1.0
Document Status
Draft
Date
May 2026
Classification
Confidential

1. Document Information

Product Name
UIU HealthCare
Product Type
AI-Powered Healthcare Management Web Application
Target Market
Bangladesh (Primary), International Expansion (Future)
Document Owner
UIU HealthCare Product Team
Stakeholders
Patients, Doctors, Hospitals, Pharmacies, Insurance Companies, Administrators
Review Cycle
Quarterly

2. Executive Summary
UIU HealthCare is a comprehensive, AI-powered digital healthcare platform designed to serve as a unified ecosystem connecting patients, doctors, hospitals, pharmacies, insurance companies, and administrators across Bangladesh. The platform eliminates fragmented healthcare experiences by providing seamless access to appointment booking, electronic health records, telemedicine, e-pharmacy, mental wellness tools, emergency services, and an AI medical assistant — all within a single, secure web application.

The platform is built on modern web technologies (Next.js, FastAPI, PostgreSQL) with an AI layer powered by Llama 3 / Qwen models using RAG architecture, deployed on cloud infrastructure with enterprise-grade security. UIU HealthCare aims to reduce healthcare inefficiencies, improve accessibility, digitize patient records, and measurably improve health outcomes across Bangladesh with future international expansion planned.

2.1 Vision Statement
To become the leading unified digital healthcare ecosystem in Bangladesh, where patients, doctors, hospitals, pharmacies, insurance providers, and administrators interact through a single secure and intelligent platform — improving healthcare accessibility, efficiency, transparency, and patient outcomes.

2.2 Mission Statement
To eliminate healthcare inefficiencies in Bangladesh by digitizing every touchpoint of the patient journey — from symptom discovery and appointment booking to prescription management, medicine delivery, mental wellness tracking, and emergency response — powered by verified medical intelligence and AI assistance.

2.3 Key Success Metrics

Metric
Target (Year 1)
Target (Year 3)
Registered Patients
50,000+
500,000+
Verified Doctors
1,000+
10,000+
Partner Hospitals
100+
1,000+
Appointments Booked
200,000+
5,000,000+
AI Assistant Queries
1,000,000+
20,000,000+
Prescription Fill Rate
80%+ digital
95%+ digital
Emergency Response Time
< 5 minutes
< 3 minutes

3. Problem Statement & Market Opportunity
3.1 Core Problems Being Solved

Problem
Impact
UIU HealthCare Solution
Long hospital waiting times (2–5+ hours)
Patient time loss, reduced care quality
Online booking, queue management, reminders
Lost medical records & prescriptions
Repeated tests, wrong medication risks
Lifetime cloud-stored EHR with search
Unverified online medical advice
Misinformation-driven health decisions
AI assistant with verified medical knowledge
Difficulty locating healthcare facilities
Delayed treatment, especially in emergencies
OpenStreetMap with real-time facility search
Mental health neglect & stigma
Untreated mental conditions
Anonymous digital wellness tools & screening
Slow emergency response
Preventable deaths and complications
One-touch SOS, ambulance dispatch, GPS sharing
Insurance paperwork burden
Delayed claims, patient frustration
Digital records, insurance-ready report export

3.2 Market Context
    • Bangladesh has a population of approximately 170 million people, the majority of whom have limited access to organized digital healthcare services.
    • Mobile internet penetration has grown to over 50%, creating a viable digital health infrastructure foundation.
    • The Bangladeshi digital health market is estimated to reach $500M+ by 2027, growing at a CAGR of 20%.
    • Less than 10% of medical records in Bangladesh are currently digitized, representing a large unaddressed gap.
    • Mental health services are significantly underutilized due to stigma and lack of accessible, anonymous resources.

4. Stakeholders & User Personas
4.1 System Users Overview

User Role
Primary Responsibilities
Key Platform Capabilities
Patient
Primary healthcare consumer; manages personal health journey
Appointments, EHR, e-pharmacy, AI assistant, wellness tracking, emergency SOS
Doctor
Licensed medical professional providing care and prescriptions
Appointment management, patient records, digital prescriptions, telemedicine, earnings
Hospital
Healthcare institution managing departments, staff, and patients
Department & doctor management, appointment monitoring, ambulance dispatch, revenue reports
Pharmacy
Medication supplier with prescription verification responsibilities
Prescription verification, inventory management, order processing, delivery tracking
Insurance
Insurance provider reviewing and approving medical claims
Claims dashboard, digital report receipt, verification, claim analytics
Administrator
Platform superuser managing all entities, compliance, and operations
Full platform management, verification workflows, security controls, audit logs, analytics

5. Functional Requirements
5.1 Authentication & Authorization System
Priority: P0 — Critical

5.1.1 User Registration
    • Multi-step registration form with role selection (Patient, Doctor, Hospital, Pharmacy, Insurance)
    • Email verification with time-limited token (24-hour expiry)
    • Phone number verification via OTP for Bangladesh mobile numbers
    • Profile completion wizard upon first login
    • Terms of Service and Privacy Policy acceptance gate

5.1.2 Login & Session Management
    • Email/password authentication with bcrypt password hashing
    • JWT-based session management with refresh token rotation
    • Remember-me functionality with configurable session duration
    • Concurrent session detection and management
    • Account lockout after 5 failed attempts (15-minute cooldown)

5.1.3 Password Recovery
    • Forgot password via registered email with secure reset link
    • Reset link expiry: 1 hour from generation
    • Password strength enforcement: minimum 8 characters, mixed case, number, and special character

5.1.4 Role-Based Access Control (RBAC)
    • Six distinct roles: Patient, Doctor, Hospital, Pharmacy, Insurance, Admin
    • Granular permission matrix per role
    • Role verification required before granting dashboard access (Doctor, Hospital, Pharmacy require admin approval)
    • Admin can promote, demote, suspend, or permanently ban accounts

5.2 Appointment Management
Priority: P0 — Critical

5.2.1 Patient — Booking Flow
    1. Patient searches for doctors by name, specialty, hospital affiliation, or location
    2. Patient views doctor profile: qualifications, experience, consultation fees, reviews, availability
    3. Patient selects preferred date and time slot from real-time doctor calendar
    4. Patient selects consultation type: In-Person, Video, Audio, or Chat
    5. Patient completes payment (bKash, Nagad, SSLCommerz, Rocket, or cash option)
    6. System sends confirmation with appointment ID, date/time, and join link (if virtual)
    7. Automated reminders sent 24 hours and 1 hour before appointment

5.2.2 Doctor — Appointment Management
    • Weekly calendar view with drag-and-drop schedule configuration
    • Accept, decline, or reschedule incoming appointment requests
    • Patient history and chief complaint visible before consultation begins
    • Post-consultation: add diagnosis, attach reports, generate digital prescription
    • Consultation notes with templates for common conditions

5.2.3 Appointment Rules & Constraints
    • Maximum 2 active reschedulings per appointment
    • Free cancellation up to 4 hours before appointment; 50% refund within 4 hours
    • No-show policy: 3 no-shows result in temporary booking restriction
    • Appointment history retained indefinitely in EHR

5.3 Electronic Health Records (EHR)
Priority: P0 — Critical

5.3.1 Record Types Supported
    • Medical consultation reports
    • Laboratory test results (blood work, urine analysis, cultures, etc.)
    • Radiology reports: X-Ray, CT Scan, MRI, Ultrasound
    • Vaccination and immunization records
    • Prescription history (linked to prescribing doctor)
    • Surgery and procedure reports
    • Chronic disease monitoring logs (diabetes, hypertension, asthma, etc.)

5.3.2 EHR Access Control
    • Patients control sharing permissions: can grant/revoke doctor access to specific record sets
    • Doctors can view only records explicitly shared by patients or records they created
    • Insurance companies receive only insurance-designated report packages
    • All access events are logged in audit trail

5.3.3 File Management
    • Supported formats: PDF, JPG, PNG, DICOM (for radiology)
    • Maximum upload size: 50MB per file, 5GB total storage per patient
    • Automatic PDF preview generation for all uploaded documents
    • OCR-based text extraction for searchability
    • AES-256 encryption at rest; TLS 1.3 in transit

5.4 Digital Prescription System
Priority: P0 — Critical

    • Doctor composes prescription within post-consultation workflow
    • Prescription includes: patient demographics, diagnosis, medication name, dosage, frequency, duration, and special instructions
    • Drug interaction checker: system flags potential interactions from medication database
    • QR code embedded in prescription for pharmacy verification
    • Digital signature using doctor's registered credentials
    • PDF export with: UIU HealthCare header, hospital/clinic logo, doctor BMDC registration number
    • Prescription accessible to patient in their EHR indefinitely
    • Pharmacy can verify authenticity via QR scan or prescription ID lookup
    • Prescription cannot be altered after issuance; amendments require new prescription with reference to original

5.5 E-Pharmacy Module
Priority: P1 — High

5.5.1 Medicine Search & Catalog
    • Searchable database of medications: generic name, brand name, category, manufacturer
    • Prescription-required flag for controlled medicines
    • Medication information pages: uses, dosage, side effects, contraindications
    • Stock availability indicator by partner pharmacy

5.5.2 Order & Fulfillment
    • Upload prescription or link from EHR for prescription-only medicines
    • Pharmacy verifies prescription before confirming order
    • Real-time order status tracking: Pending → Verified → Packed → Dispatched → Delivered
    • Estimated delivery time shown at checkout
    • Delivery partner integration for last-mile logistics

5.5.3 Payment & Returns
    • Supported gateways: bKash, Nagad, SSLCommerz, Rocket
    • Invoice auto-generated and stored in patient account
    • Return window: 24 hours for sealed, unopened, non-prescription items
    • Refund processed within 3–5 business days to original payment method

5.6 Mental Wellness Module
Priority: P1 — High

5.6.1 Screening Tools
    • PHQ-9: Depression screening with severity scoring
    • GAD-7: Generalized Anxiety Disorder assessment
    • PSS-10: Perceived Stress Scale
    • Results stored in EHR; trend analysis shown over time
    • Clinical thresholds trigger recommendation to consult a mental health professional

5.6.2 Wellness Activities
    • Guided breathing exercises: 4-7-8, box breathing, diaphragmatic
    • Guided meditation sessions: 5, 10, 15, and 30-minute sessions
    • Daily mood tracking with optional journal entry
    • Sleep quality logging
    • Streak system for consistency motivation

5.7 Physical Health Tracking
Priority: P2 — Medium

    • BMI calculator with WHO classification and interpretation
    • Daily water intake tracker with hydration goal (customizable by weight)
    • Step counter integration (mobile web app bridge to device sensors)
    • Exercise logging: type, duration, calories burned (estimated)
    • Weekly and monthly progress reports with trend visualization
    • Goal-setting for weight, steps, water intake, and exercise frequency

5.8 AI Medical Assistant
Priority: P1 — High

5.8.1 Capabilities
    • Symptom explanation: describes symptoms in plain language
    • Disease information: etiology, symptoms, treatment overview, prevention
    • Medication information: usage, common side effects, administration guidelines
    • Doctor specialty recommendation: suggests appropriate specialist based on described symptoms
    • Health education: nutrition, lifestyle, preventive care
    • Bilingual support: English and Bangla

5.8.2 Architecture & Constraints
    • Model: Llama 3 / Qwen via LangChain with RAG over curated medical knowledge base (ChromaDB)
    • Knowledge base updated quarterly with verified medical literature
    • Response includes mandatory disclaimer: 'This information is for educational purposes only and does not constitute medical advice.'
    • No personally identifiable health data is used in AI inference unless patient explicitly activates a session
    • Conversation history stored per session; not shared with third parties
    • AI monitoring dashboard for admins: query volume, flagged responses, model accuracy metrics

5.9 Emergency Services
Priority: P0 — Critical

    • One-tap SOS button accessible from patient dashboard header (persistent across all pages)
    • On SOS activation: GPS location captured and transmitted; emergency contacts notified via SMS; nearest emergency center displayed
    • Ambulance request: form with location, patient condition summary, contact number; dispatched to nearest partner hospital
    • Pre-registered emergency contacts: up to 5 contacts with relationship tags
    • Emergency contacts notified via both SMS and in-app notification
    • Emergency call shortcut to national emergency number 999
    • Nearby emergency center map (OpenStreetMap) with real-time distance
    • Emergency history log maintained in patient record

5.10 Hospital Locator
Priority: P1 — High

    • Map powered by OpenStreetMap + Leaflet.js
    • Location-based search: hospitals, clinics, diagnostic centers, pharmacies
    • Filters: facility type, specialty, distance radius, 24-hour availability
    • Facility detail cards: name, address, phone, available specialties, hours, rating
    • Turn-by-turn navigation handoff to device maps app
    • Favorite facilities can be saved to patient profile

5.11 Telemedicine
Priority: P1 — High

    • Video consultation: HD video with screen sharing capability
    • Audio consultation: voice-only option for low-bandwidth scenarios
    • Chat consultation: asynchronous messaging with file attachment support
    • Virtual waiting room with estimated wait time display
    • Session recording with explicit patient consent (stored 30 days, then auto-deleted unless flagged)
    • Consultation notes taken within the telemedicine interface
    • Prescription generation directly from consultation interface

5.12 Insurance Integration
Priority: P2 — Medium

    • Patient can link insurance policy to account
    • Insurance-ready report packages exportable as PDF with standardized formatting
    • Insurance company portal: receives digital documents, updates claim status
    • Claim status visible to patient: Submitted → Under Review → Approved / Rejected
    • Audit trail of all document sharing events

6. Non-Functional Requirements
6.1 Performance

Requirement
Target
Measurement
Page Load Time (LCP)
< 2.5 seconds
Google Core Web Vitals
API Response Time (P95)
< 300ms
APM tooling (e.g., Datadog)
AI Assistant Response Time
< 5 seconds
End-to-end latency monitoring
Concurrent Users Supported
10,000+ simultaneous
Load testing (k6 / Locust)
System Uptime
99.9% SLA
Monthly uptime reporting

6.2 Security Requirements

    • HTTPS enforced across all endpoints (TLS 1.3); HTTP requests redirected
    • JWT access tokens expire in 15 minutes; refresh tokens in 7 days with rotation
    • All passwords hashed with bcrypt (minimum cost factor 12)
    • AES-256 encryption for all PHI (Protected Health Information) at rest
    • SQL injection prevention via SQLAlchemy ORM parameterization
    • XSS prevention via React's built-in escaping and Content Security Policy headers
    • CSRF tokens on all state-changing API requests
    • Rate limiting: 100 API requests per minute per authenticated user; 20 per minute for anonymous
    • File upload validation: MIME type checking, malware scanning before storage
    • Penetration testing conducted before launch and annually thereafter
    • Security incident response plan with < 4-hour notification SLA for data breaches

6.3 Scalability & Availability

    • Horizontal scaling via containerized microservices (Docker + Kubernetes)
    • Database read replicas for query-heavy workloads
    • Redis caching for session data, frequently accessed doctor schedules, and medication catalog
    • CDN for static assets (images, fonts, JavaScript bundles)
    • Multi-zone AWS / DigitalOcean deployment for failover
    • Database backups: incremental hourly, full daily, retained for 30 days
    • Disaster recovery RTO: 4 hours; RPO: 1 hour

6.4 Accessibility & Usability

    • WCAG 2.1 Level AA compliance target
    • Responsive design: desktop, tablet, mobile (minimum 320px viewport)
    • Keyboard navigation support throughout all public and authenticated pages
    • ARIA labels on all interactive elements
    • Minimum contrast ratio 4.5:1 for normal text, 3:1 for large text
    • Support for screen readers (NVDA, VoiceOver)
    • Language support: English (primary), Bangla (secondary)

7. System Architecture
7.1 Technology Stack

Layer
Technology
Rationale
Frontend
Next.js 14, React, TypeScript, Tailwind CSS, ShadCN UI
SSR for SEO, type safety, rapid UI development
Backend
Python, FastAPI, SQLAlchemy, JWT Auth
High performance async API, ORM for safe DB access
Database
PostgreSQL (primary), Redis (cache/sessions)
ACID compliance for medical data; Redis for sub-ms caching
AI Layer
Llama 3 / Qwen, LangChain, ChromaDB, RAG Architecture
Open-source LLMs for data privacy; RAG grounds responses in verified knowledge
Maps
OpenStreetMap, Leaflet.js
Open-source, no vendor lock-in, lower cost vs. Google Maps
Payments
bKash, Nagad, SSLCommerz, Rocket
Covers all major BD mobile banking and card gateways
DevOps
Docker, Nginx, AWS/DigitalOcean, GitHub Actions
Containerized, repeatable deployments with CI/CD

8. Page & Dashboard Inventory
8.1 Public Website Pages

Page
Key Content / Purpose
Auth Required
Home
Hero banner, featured doctors, platform highlights, CTA
No
About Us
Company mission, team, values, platform statistics
No
Doctors
Searchable & filterable doctor directory
No
Doctor Details
Full profile, schedule, reviews, booking CTA
No
Hospitals
Partner hospital directory with map
No
Hospital Details
Hospital profile, departments, doctors, contact
No
Pharmacy
Medicine search, featured products, partner pharmacies
No
Mental Wellness
Wellness resource hub, screening tool previews
No
AI Assistant
Public AI assistant with educational queries
No
Emergency Services
Emergency info, SOS preview, 999 reference
No
Health Articles
Blog / knowledge base with categorized articles
No
Contact Us
Contact form, phone, address, support hours
No
Login
Email/password login, social login (future)
No
Registration
Role-based sign-up flow with verification
No

8.2 Patient Dashboard

Dashboard Section
Key Features
Dashboard
Summary cards: upcoming appointments, recent records, active prescriptions, wellness score
Profile
Personal info, photo, contact, emergency contacts, insurance policy, account settings
Appointments
Upcoming / past bookings, cancel/reschedule, join virtual consultation
Medical Records
Categorized EHR view, upload, search, share with doctor/insurance
Prescriptions
Prescription history, PDF download, send to pharmacy
Insurance Reports
Package export, claim status tracking, linked insurance company
E-Pharmacy
Medicine search, cart, checkout, order tracking, order history
Mental Wellness
PHQ-9 / GAD-7 screening, mood tracker, breathing exercises, history
Physical Wellness
BMI, water intake, steps, exercise log, progress charts
Notifications
Appointment reminders, prescription alerts, claim updates, system messages
AI Assistant
Full AI medical chat with session history
Emergency
SOS configuration, emergency contacts, ambulance request, nearby centers
Settings
Password change, notification preferences, privacy settings, data export, account deletion

8.3 Doctor Dashboard

Dashboard Section
Key Features
Dashboard
Today's appointments, patient queue, unread messages, earnings summary
Profile
Professional bio, BMDC number, specialties, consultation fees, availability hours
Appointment Management
Calendar view, accept/decline/reschedule, appointment detail view
Patient Records
Shared records per patient, record access history
Prescription Management
Create, view, and reprint prescriptions; prescription templates
Medical Reports
Upload/attach lab and radiology reports to patient records
Telemedicine
Join video/audio consultation, chat interface, session notes
Earnings
Consultation revenue summary, payout history, transaction log
Notifications
New bookings, cancellations, patient messages, system alerts
Settings
Password, notification preferences, schedule configuration, bank account for payouts

8.4 Hospital, Pharmacy, Insurance & Admin Dashboards

Hospital Dashboard
    • Dashboard: bed availability overview, daily admission/discharge, revenue snapshot
    • Departments: add, edit, and manage clinical departments with assigned doctors
    • Doctors: manage affiliated doctor profiles, onboarding, and scheduling
    • Appointments: full hospital appointment log with filter by department
    • Medical Records: hospital-generated patient records
    • Ambulance Management: fleet status, dispatch log, driver assignment
    • Revenue Reports: income by department, doctor, and service type
    • Settings: hospital profile, logos, branding, notification config

Pharmacy Dashboard
    • Dashboard: daily order volume, pending verifications, low-stock alerts
    • Inventory: product catalog, stock levels, expiry tracking, reorder alerts
    • Prescription Verification: incoming prescription queue with QR validation
    • Orders: order queue with status management
    • Deliveries: dispatch management and delivery partner tracking
    • Revenue Reports: sales by product, category, and time period

Insurance Dashboard
    • Dashboard: active claims summary, pending reviews, approval rate metrics
    • Claims: incoming claim queue with patient report packages
    • Reports: received medical documents, download and archive
    • Verification: policy verification and link to patient account
    • Analytics: claim trends, rejection reasons, settlement timelines

Administrator Dashboard
    • Dashboard: platform-wide health metrics, user growth, active sessions
    • User Management: search, view, suspend, restore, or delete any user account
    • Doctor Verification: review BMDC credentials, approve or reject registrations
    • Hospital Verification: review licensing documents, approve or reject
    • Pharmacy Verification: review pharmacy license and owner documents
    • Insurance Management: manage insurance company accounts and permissions
    • Appointment Monitoring: platform-wide appointment analytics and dispute resolution
    • Payment Management: transaction log, refund processing, payout management
    • AI Monitoring: AI query volume, flagged responses, model performance
    • Blog Management: create, edit, publish, and archive health articles
    • Analytics: full platform analytics with exportable reports
    • Audit Logs: immutable log of all admin actions and data access events
    • Security Settings: rate limiting config, IP whitelisting, session policy

9. UI/UX Design Specifications
9.1 Design System

Token
Value
Usage
Primary Blue (Light)
#2563EB
Buttons, links, navigation highlights, headings
Health Green (Light)
#10B981
Success states, wellness indicators, CTAs
Background (Light)
#FFFFFF
Page backgrounds, card surfaces
Body Text (Light)
#1F2937
Primary text, labels, descriptions
Background (Dark)
#0F172A
Dark mode page background
Card Surface (Dark)
#1E293B
Dark mode card and panel backgrounds
Text (Dark)
#F8FAFC
Dark mode primary text
Primary Blue (Dark)
#3B82F6
Dark mode interactive elements
Border
#D1D5DB
Card borders, dividers, input fields
Error / Alert
#DC2626
Error states, critical alerts, SOS button

9.2 Design Principles
    • Clean & Professional: hospital-grade visual clarity with ample white space
    • Trust-Inspiring: consistent use of medical blue to convey reliability and clinical professionalism
    • Accessible: all interactive elements meet WCAG 2.1 AA contrast and size requirements
    • Mobile-First: all layouts designed for mobile viewport first, then scaled up
    • Dark Mode Parity: all features available and fully readable in dark mode
    • Feedback-Rich: loading states, success toasts, error messages, and progress indicators on all async actions

10. Feature Priority Matrix

Feature
Priority
Phase
Effort Estimate
Authentication & RBAC
P0 — Critical
Phase 1
Medium (4 weeks)
Appointment Management
P0 — Critical
Phase 1
Large (6 weeks)
Electronic Health Records
P0 — Critical
Phase 1
Large (8 weeks)
Digital Prescription System
P0 — Critical
Phase 1
Medium (4 weeks)
Emergency Services
P0 — Critical
Phase 1
Small (2 weeks)
AI Medical Assistant
P1 — High
Phase 2
Large (8 weeks)
Telemedicine (Video/Audio)
P1 — High
Phase 2
Large (8 weeks)
E-Pharmacy
P1 — High
Phase 2
Large (6 weeks)
Mental Wellness Module
P1 — High
Phase 2
Medium (4 weeks)
Hospital Locator (OSM)
P1 — High
Phase 2
Small (3 weeks)
Insurance Integration
P2 — Medium
Phase 3
Medium (4 weeks)
Physical Health Tracking
P2 — Medium
Phase 3
Small (3 weeks)
Admin Analytics Dashboard
P2 — Medium
Phase 3
Medium (4 weeks)
AI Disease Risk Prediction
P3 — Future
Phase 4
XL (12+ weeks)
Wearable Device Integration
P3 — Future
Phase 4
XL (12+ weeks)
Blockchain Medical Records
P3 — Future
Phase 5
XL (16+ weeks)

11. Release Roadmap

Phase
Timeline
Deliverables
Milestone
Phase 1 Foundation
Months 1–4
Auth system, appointment booking, EHR core, digital prescriptions, emergency SOS, public website
MVP Launch (Beta)
Phase 2 Expansion
Months 5–9
AI medical assistant, telemedicine, e-pharmacy, mental wellness, hospital locator, payment integration
GA Launch v1.0
Phase 3 Maturity
Months 10–14
Insurance integration, physical health tracking, advanced analytics, admin tools, performance optimization
Platform v2.0
Phase 4 Innovation
Month 15+
AI disease risk prediction, wearable integration, voice AI assistant, national health data integration
v3.0 / Scale
Phase 5 Global
Year 3+
Blockchain records, multi-country expansion, international payment gateways, localization
International Launch

12. Risks & Mitigations

Risk
Likelihood
Impact
Mitigation Strategy
Patient health data breach
Low
Critical
AES-256 encryption, penetration testing, RBAC, incident response plan, minimal data retention
AI assistant medical misinformation
Medium
High
RAG with verified medical corpus, mandatory disclaimers, admin monitoring, quarterly knowledge base updates
Doctor / hospital verification fraud
Medium
High
Document verification workflow, BMDC API cross-check, manual admin review, periodic re-verification
Payment gateway failure
Low
High
Multi-gateway fallback (bKash → Nagad → SSLCommerz → Rocket), retry logic, transaction state recovery
Low user adoption
Medium
High
Focused onboarding, referral program, partnerships with hospitals & insurers, Bangla language support
Regulatory non-compliance (DGDA, BDRC)
Medium
High
Legal counsel review pre-launch, quarterly compliance audit, pharmacist partner for e-pharmacy
Platform scalability under load
Low
Medium
Horizontal scaling, load testing before each major release, Redis caching, CDN for static assets
Telemedicine quality issues
Medium
Medium
WebRTC quality monitoring, fallback to audio-only, bandwidth detection, carrier optimization

13. Acceptance Criteria
13.1 Phase 1 Acceptance Criteria
    • A Patient can register, verify email, log in, book an appointment with any listed doctor, and receive an email confirmation — all within 5 minutes
    • A Doctor can log in, view today's appointment queue, open a patient's shared record, and generate a digital prescription with QR code
    • An Admin can approve a new doctor registration, suspend a patient account, and view the platform audit log
    • EHR files upload successfully in PDF/JPG/PNG format and are retrievable by the uploading patient within 30 seconds
    • Emergency SOS button captures GPS location, notifies 2+ emergency contacts via SMS, and displays nearest emergency center within 15 seconds of activation
    • All pages pass WCAG 2.1 AA automated checks (axe-core tooling)
    • System passes load test: 1,000 concurrent users with < 300ms P95 API response time

13.2 Phase 2 Acceptance Criteria
    • AI Medical Assistant returns a medically reasonable response to 95%+ of test queries from verified medical knowledge base within 5 seconds
    • Video telemedicine session achieves < 200ms latency on standard 4G connection
    • E-pharmacy order completes end-to-end: medicine search → cart → prescription upload → pharmacy verification → payment → confirmation, in under 10 minutes
    • Mental wellness PHQ-9 screening produces correctly scored results matching clinical calculator for 100% of test inputs
    • Hospital locator displays facilities within 5km radius on first load within 2 seconds

14. Appendix
14.1 Glossary

Term
Definition
EHR
Electronic Health Record — a digital version of a patient's paper chart
RBAC
Role-Based Access Control — permissions assigned based on user role
RAG
Retrieval-Augmented Generation — AI architecture grounding LLM responses in a curated knowledge base
PHQ-9
Patient Health Questionnaire-9 — clinical depression screening tool
GAD-7
Generalized Anxiety Disorder-7 — clinical anxiety screening tool
JWT
JSON Web Token — compact, self-contained token for secure authentication
OTP
One-Time Password — single-use code for identity verification
BMDC
Bangladesh Medical and Dental Council — licensing body for medical professionals in BD
DGDA
Directorate General of Drug Administration — regulatory authority for medicines in BD
LCP
Largest Contentful Paint — Core Web Vital measuring page load performance
RTO
Recovery Time Objective — maximum tolerable system restoration time after failure
RPO
Recovery Point Objective — maximum tolerable data loss in time after failure
SLA
Service Level Agreement — committed uptime and performance guarantees
PHI
Protected Health Information — individually identifiable health data under privacy regulations
P0–P3
Priority levels: P0 = Critical / must-have, P1 = High, P2 = Medium, P3 = Future / nice-to-have

14.2 Future Enhancements Backlog
    • AI Disease Risk Prediction: predictive models trained on anonymized patient data for early-warning risk scoring
    • Wearable Device Integration: sync data from Fitbit, Apple Watch, Garmin, Samsung Health via API bridges
    • Smart Health Monitoring: IoT-enabled continuous vitals monitoring (heart rate, SpO2, blood pressure)
    • Voice-Based AI Assistant: hands-free interaction in Bengali and English via Web Speech API
    • Blockchain-Based Medical Records: tamper-proof EHR using distributed ledger for immutable audit trail
    • National Healthcare Data Integration: connect with Bangladesh MOHFW's national health information system
    • Multi-Country Expansion: localization for South Asian markets (India, Nepal, Sri Lanka) with local payment gateways and regulatory compliance
    • Mobile Native Apps: React Native iOS and Android apps leveraging the existing API layer

14.3 Document Revision History

Version
Date
Changes
Author
1.0
May 2026
Initial release — full PRD from project overview
UIU HealthCare Team

UIU HealthCare — Confidential Product Requirements Document v1.0
Improving Healthcare Accessibility, Efficiency, and Outcomes Across Bangladesh