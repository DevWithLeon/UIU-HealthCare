# UIU HealthCare System

A full-stack MERN (MongoDB, Express, React, Node.js) healthcare management system built for university project submission.  
It includes authentication, user management, and backend API integration.

## Features

- User Registration and Login (JWT Authentication)
- Secure password hashing using bcrypt
- REST API with Express.js
- MongoDB Atlas database integration
- React frontend with API connection
- Modular backend structure
- Protected authentication system

## Tech Stack

Frontend:
- React.js
- Axios
- Vite

Backend:
- Node.js
- Express.js
- MongoDB Atlas
- JSON Web Token (JWT)
- bcryptjs



## Setup Instructions

### Install Frontend
npm install
npm run dev

### Install Backend
cd backend
npm install
npm run dev

### Environment Variables
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=secretkey

## API Endpoints

POST /api/auth/register - Register user  
POST /api/auth/login - Login user  

## Authentication Flow

1. User registers
2. Password hashed with bcrypt
3. User logs in
4. JWT token generated
5. Token stored in frontend

## Future Improvements

- Appointment system
- Doctor dashboard
- Admin panel
- Deployment (Vercel + Render)

## Author
Shah Mohammed Seaman

UIU HealthCare 

