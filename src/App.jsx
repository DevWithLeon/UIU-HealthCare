import React, { useState, useEffect } from 'react';
import PublicHome from './pages/PublicHome';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorsPage from './pages/DoctorsPage';
import HospitalsPage from './pages/HospitalsPage';
import EmergencyPage from './pages/EmergencyPage';
import AIAssistantPage from './pages/AIAssistantPage';
import MentalWellnessPublic from './pages/MentalWellnessPublic';
import InsuranceDashboard from './pages/InsuranceDashboard';
import AboutPage from './pages/AboutPage';
import ForumPage from './pages/ForumPage';
import BloodDonorPage from './pages/BloodDonorPage';

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);

  // Restore session from localStorage on first load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Auto-navigate to their dashboard on page refresh
        const role = parsedUser.role;
        if (role === 'patient') setPage('patient-dashboard');
        else if (role === 'doctor') setPage('doctor-dashboard');
        else if (role === 'hospital') setPage('hospital-dashboard');
        else if (role === 'insurance') setPage('insurance-dashboard');
        else setPage('admin-dashboard');
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const navigate = (p) => {
    window.scrollTo(0, 0);
    setPage(p);
  };

  // Accepts either (role) for demo login or (role, userObj) for real backend login
  const handleLogin = (role, userObj) => {
    const resolvedUser = userObj || {
      role,
      name: role === 'admin' ? 'Admin User'
          : role === 'doctor' ? 'Dr. Aisha Rahman'
          : role === 'hospital' ? 'Dhaka Medical Center'
          : 'Rahul Ahmed'
    };
    setUser(resolvedUser);
    if (role === 'patient') navigate('patient-dashboard');
    else if (role === 'doctor') navigate('doctor-dashboard');
    else if (role === 'hospital') navigate('hospital-dashboard');
    else if (role === 'insurance') navigate('insurance-dashboard');
    else navigate('admin-dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('home');
  };

  const commonProps = { navigate, user, onLogout: handleLogout };

  return (
    <div className="min-h-screen">
      {page === 'home' && <PublicHome {...commonProps} />}
      {page === 'login' && <LoginPage {...commonProps} onLogin={handleLogin} />}
      {page === 'register' && <RegisterPage {...commonProps} />}
      {page === 'doctors' && <DoctorsPage {...commonProps} />}
      {page === 'hospitals' && <HospitalsPage {...commonProps} />}
      {page === 'emergency' && <EmergencyPage {...commonProps} />}
      {page === 'ai-assistant' && <AIAssistantPage {...commonProps} />}
      {page === 'mental-wellness' && <MentalWellnessPublic {...commonProps} />}
      {page === 'patient-dashboard' && <PatientDashboard {...commonProps} />}
      {page === 'doctor-dashboard' && <DoctorDashboard {...commonProps} />}
      {page === 'hospital-dashboard' && <HospitalDashboard {...commonProps} />}
      {page === 'admin-dashboard' && <AdminDashboard {...commonProps} />}
      {page === 'about' && <AboutPage {...commonProps} />}
      {page === 'insurance-dashboard' && <InsuranceDashboard {...commonProps} />}
      {page === 'forum' && <ForumPage {...commonProps} />}
      {page === 'blood-donors' && <BloodDonorPage {...commonProps} />}
    </div>
  );
}
