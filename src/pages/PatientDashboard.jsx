import React, { useState, useEffect } from 'react';
import { 
  Heart, Activity, Calendar, FileText, Pill, AlertTriangle, 
  Settings, LogOut, Search, Bell, User, Clock, 
  MapPin, Stethoscope, Video, ChevronRight, Download, Loader, Shield, Brain, X, Smile, Music, MessageSquare, Droplet
} from 'lucide-react';
import API from '../api';

export default function PatientDashboard({ user, onLogout, navigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [activeWellnessModal, setActiveWellnessModal] = useState(null);

  const [cancelRef, setCancelRef] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [healthRecords, setHealthRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({ title: '', type: 'Lab Result', file: null });

  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [newClaim, setNewClaim] = useState({ title: '', description: '', amount: '', record_id: '' });
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  // Medical Tests state
  const [testForm, setTestForm] = useState({ testName: '', hospitalId: '', insuranceCompany: '', policyNumber: '', fee: 0 });
  const [testSuccess, setTestSuccess] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [myTests, setMyTests] = useState([]);

  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPres, setLoadingPres] = useState(false);

  // Fetch appointments and records
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      setLoadingAppts(true);
      const apptRes = await API.get('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(apptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppts(false);
    }

    try {
      setLoadingRecords(true);
      const recRes = await API.get('/api/records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHealthRecords(recRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }

    try {
      setLoadingClaims(true);
      const claimRes = await API.get('/api/insurance/my-claims', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(claimRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClaims(false);
    }

    try {
      setLoadingPres(true);
      const presRes = await API.get('/api/prescriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(presRes.data || []);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoadingPres(false);
    }

    try {
      // Fetch Hospitals (for test booking)
      const hospitalsRes = await API.get('/api/auth/hospitals');
      if(hospitalsRes.data) {
        setHospitals(hospitalsRes.data);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const testsRes = await API.get('/api/tests/my-tests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTests(testsRes.data || []);
    } catch(err) {
      console.error(err);
    }
  };

  const handleCreateClaim = async () => {
    setClaimError('');
    setClaimSuccess('');

    let finalTitle = newClaim.title?.trim();
    if (!finalTitle && newClaim.record_id) {
      const matched = healthRecords.find(r => r.id === parseInt(newClaim.record_id));
      if (matched) {
        finalTitle = `Reimbursement for ${matched.title}`;
      }
    }

    if (!finalTitle || !newClaim.amount) {
      setClaimError('Title and amount are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await API.post('/api/insurance', { ...newClaim, title: finalTitle }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaimSuccess('Claim submitted successfully!');
      setNewClaim({ title: '', description: '', amount: '', record_id: '' });
      setTimeout(() => {
        setShowClaimModal(false);
        setClaimSuccess('');
      }, 1500);
      fetchDashboardData();
    } catch (err) {
      setClaimError(err.response?.data?.error || 'Failed to submit claim.');
    }
  };

  const printTestInvoice = (test) => {
    const printWindow = window.open('', '_blank');
    const isInsured = test.insurance_company && test.policy_number;
    const discount = isInsured ? `(Includes 40% Insurance Discount via ${test.insurance_company})` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice_${test.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; color: #334155; padding: 40px; margin: 0; background: white; }
            .container { max-width: 700px; margin: 0 auto; border: 1px solid #E2E8F0; padding: 40px; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #10B981; padding-bottom: 20px; margin-bottom: 20px; }
            .logo-text { font-size: 1.5rem; font-weight: 800; color: #10B981; }
            .title { font-size: 1.5rem; font-weight: 800; color: #1E293B; margin: 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-box { background: #F8FAFC; padding: 16px; border-radius: 8px; border: 1px solid #F1F5F9; }
            .info-box span { display: block; font-size: 0.85rem; color: #64748B; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
            .info-box strong { font-size: 1.1rem; color: #1E293B; }
            .table-wrapper { margin-top: 30px; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #F1F5F9; text-align: left; padding: 12px 16px; color: #475569; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
            td { padding: 16px; border-bottom: 1px solid #E2E8F0; color: #1E293B; font-weight: 500; }
            .total-row { background: #F8FAFC; }
            .total-row td { font-weight: 800; font-size: 1.2rem; color: #10B981; }
            @media print { body { padding: 0; } .container { border: none; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <h1 class="title">Medical Test Invoice</h1>
                <p style="color: #64748B; margin: 4px 0 0 0;">Invoice #${test.id.toString().padStart(6, '0')}</p>
              </div>
              <div style="text-align: right;">
                <div class="logo-text">UIU HealthCare</div>
                <p style="font-size: 0.8rem; color: #64748B; margin: 4px 0;">Official Billing Receipt</p>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-box">
                <span>Patient Name</span>
                <strong>${user.name}</strong>
                <div style="font-size: 0.9rem; color: #475569; margin-top: 4px;">Phone: ${user.phone || 'N/A'}</div>
              </div>
              <div class="info-box">
                <span>Hospital Assigned</span>
                <strong>${test.hospital_name}</strong>
                <div style="font-size: 0.9rem; color: #475569; margin-top: 4px;">Date: ${new Date(test.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Test Description</th>
                    <th style="text-align: right;">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style="font-weight: 700;">${test.test_name}</div>
                      ${isInsured ? `<div style="font-size: 0.85rem; color: #10B981; margin-top: 4px;">${discount}</div>` : ''}
                    </td>
                    <td style="text-align: right;">৳${test.total_fee}</td>
                  </tr>
                  <tr class="total-row">
                    <td style="text-align: right;">Total Paid:</td>
                    <td style="text-align: right;">৳${test.total_fee}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-top: 40px; text-align: center; color: #64748B; font-size: 0.85rem;">
              <p>This is a computer-generated invoice and does not require a physical signature.</p>
              <p>Please present this invoice at the hospital desk for your test.</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printPrescription = (rx) => {
    const printWindow = window.open('', '_blank');
    
    let meds = [];
    try {
      meds = JSON.parse(rx.medications);
    } catch (e) {
      meds = [{ name: rx.medications, dosage: '', instruction: '', duration: '' }];
    }

    const medsHtml = meds.map((m, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 12px 0; font-weight: bold; color: #1E293B;">
          ${idx + 1}. ${m.name}
          <div style="font-size: 0.85rem; color: #64748B; font-weight: normal; margin-top: 4px;">
            ${m.instruction}
          </div>
        </td>
        <td style="padding: 12px 0; text-align: center; font-weight: 600; color: #2563EB;">${m.dosage}</td>
        <td style="padding: 12px 0; text-align: right; color: #475569;">${m.duration}</td>
      </tr>
    `).join('');

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(rx.qr_code || 'UIU-HealthRx')}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription_${rx.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #334155;
              line-height: 1.5;
              padding: 40px;
              margin: 0;
              background: white;
            }
            .presc-container {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #E2E8F0;
              padding: 40px;
              border-radius: 12px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 3px solid #2563EB;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .doctor-info {
              text-align: left;
            }
            .doctor-name {
              font-size: 1.5rem;
              font-weight: 800;
              color: #1E293B;
              margin: 0 0 4px 0;
            }
            .doctor-meta {
              font-size: 0.9rem;
              color: #475569;
              margin: 2px 0;
            }
            .hospital-logo {
              text-align: right;
            }
            .logo-text {
              font-size: 1.5rem;
              font-weight: 800;
              color: #2563EB;
            }
            .patient-bar {
              display: grid;
              grid-template-cols: 2fr 1fr 1fr;
              background: #F8FAFC;
              padding: 12px 20px;
              border-radius: 8px;
              font-size: 0.9rem;
              margin-bottom: 30px;
              border: 1px solid #F1F5F9;
            }
            .patient-bar div span {
              font-weight: bold;
              color: #1E293B;
            }
            .main-content {
              display: grid;
              grid-template-cols: 1fr 2.5fr;
              gap: 40px;
              min-height: 400px;
            }
            .sidebar-col {
              border-right: 1px solid #E2E8F0;
              padding-right: 20px;
            }
            .section-title {
              font-size: 1rem;
              font-weight: 700;
              color: #1E293B;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 12px;
              border-bottom: 2px solid #F1F5F9;
              padding-bottom: 6px;
            }
            .sidebar-item {
              font-size: 0.9rem;
              margin-bottom: 20px;
              color: #475569;
            }
            .rx-symbol {
              font-size: 2.2rem;
              font-weight: 800;
              color: #2563EB;
              margin-bottom: 10px;
              font-style: italic;
            }
            .meds-table {
              width: 100%;
              border-collapse: collapse;
            }
            .meds-table th {
              text-align: left;
              padding-bottom: 10px;
              border-bottom: 2px solid #E2E8F0;
              color: #64748B;
              font-size: 0.85rem;
              text-transform: uppercase;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #E2E8F0;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .signature-box {
              text-align: center;
              border-top: 1px dashed #CBD5E1;
              padding-top: 8px;
              width: 200px;
              font-size: 0.85rem;
              color: #64748B;
              margin-top: 20px;
            }
            .signature-font {
              font-family: 'Brush Script MT', cursive, sans-serif;
              font-size: 1.8rem;
              color: #1E293B;
              margin-bottom: -5px;
            }
            @media print {
              body {
                padding: 0;
              }
              .presc-container {
                border: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="presc-container">
            <div class="header">
              <div class="doctor-info">
                <h1 class="doctor-name">${rx.doctor_name || 'Dr. Aisha Rahman'}</h1>
                <p class="doctor-meta" style="font-weight: 600;">${rx.specialty || 'General Practitioner'}</p>
                <p class="doctor-meta">${rx.degree || 'MBBS, FCPS'}</p>
                <p class="doctor-meta">${rx.hospital || 'UIU HealthCare Centre'}</p>
                <p class="doctor-meta">BMDC Reg No: ${rx.bmdc_number || 'A-89472'}</p>
                <p class="doctor-meta">Phone: ${rx.doctor_phone || 'N/A'}</p>
              </div>
              <div class="hospital-logo">
                <div class="logo-text">UIU HealthCare</div>
                <p style="font-size: 0.8rem; color: #64748B; margin: 4px 0;">Digital Prescribing Service</p>
              </div>
            </div>

            <div class="patient-bar">
              <div>Patient: <span>${rx.patient_name || 'Patient'}</span></div>
              <div>Phone: <span>${rx.patient_phone || 'N/A'}</span></div>
              <div style="text-align: right;">Date: <span>${new Date(rx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
            </div>

            <div class="main-content">
              <div class="sidebar-col">
                <div class="section-title">Diagnosis</div>
                <div class="sidebar-item" style="font-weight: 600; color: #1E293B;">
                  ${rx.diagnosis || 'General Checkup'}
                </div>
                
                <div class="section-title" style="margin-top: 30px;">Advice</div>
                <div class="sidebar-item" style="white-space: pre-line;">
                  ${rx.advice || 'No special advice.'}
                </div>

                ${rx.suggested_tests ? `
                <div class="section-title" style="margin-top: 30px; color: #D97706;">Suggested Tests</div>
                <div class="sidebar-item" style="font-weight: 600; color: #B45309; white-space: pre-line;">
                  ${rx.suggested_tests}
                </div>
                ` : ''}
                </div>
              <div class="meds-col">
                <div class="rx-symbol">Rx</div>
                <table class="meds-table">
                  <thead>
                    <tr>
                      <th style="width: 50%;">Medicine Name</th>
                      <th style="width: 25%; text-align: center;">Dosage</th>
                      <th style="width: 25%; text-align: right;">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${medsHtml}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="footer">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${qrCodeUrl}" alt="Verification QR Code" style="border: 1px solid #E2E8F0; padding: 4px; border-radius: 4px; width: 80px; height: 80px;" />
                <div>
                  <div style="font-size: 0.85rem; font-weight: bold; color: #1E293B;">Verified Digital Rx</div>
                  <div style="font-size: 0.75rem; color: #64748B; margin-top: 2px;">Scan QR to verify authenticity</div>
                  <div style="font-size: 0.75rem; color: #2563EB; font-family: monospace; margin-top: 2px;">RX-${rx.id}-${new Date(rx.created_at).getFullYear()}</div>
                </div>
              </div>
              <div>
                <div class="signature-font">${rx.doctor_name ? rx.doctor_name.replace('Dr. ', '') : 'Authorized'}</div>
                <div class="signature-box">
                  Authorized Signature
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleCancelAppointment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel appointment');
    }
  };

  const handleCancelByRef = async () => {
    setCancelError('');
    setCancelSuccess('');
    if (!cancelRef.trim()) {
      setCancelError('Please enter an appointment reference.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await API.post('/api/appointments/cancel-by-ref', { ref_code: cancelRef.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCancelSuccess('Appointment cancelled successfully.');
      setCancelRef('');
      fetchDashboardData();
    } catch (err) {
      setCancelError(err.response?.data?.error || 'Failed to cancel appointment');
    }
  };

  const handleUploadRecord = async () => {
    setUploadError('');
    if (!newRecord.title || !newRecord.file) {
      const msg = 'Please provide a title and select a file.';
      setUploadError(msg);
      alert(msg);
      return;
    }
    const fileExtension = newRecord.file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'dicom'];
    if (!allowedExtensions.includes(fileExtension)) {
      const msg = 'Unsupported file format. Please upload PDF, JPG, or PNG.';
      setUploadError(msg);
      alert(msg);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newRecord.title);
      formData.append('type', newRecord.type);
      formData.append('file', newRecord.file);

      await API.post('/api/records', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowUploadModal(false);
      setNewRecord({ title: '', type: 'Lab Result', file: null });
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to upload record';
      setUploadError(msg);
      alert(msg);
    }
  };

  const nextAppointment = appointments.find(apt => apt.status === 'Upcoming');

  const iconMap = {
    'Lab Result': Activity,
    'Radiology': FileText,
    'Immunization': Heart
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'records', label: 'Health Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'tests', label: 'Medical Tests', icon: Activity },
    { id: 'insurance', label: 'Insurance Claims', icon: Shield },
    { id: 'wellness', label: 'Mental Wellness', icon: Brain },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar flex flex-col justify-between" style={{ padding: '24px 16px' }}>
        <div>
          <div className="flex items-center gap-3 mb-12 px-4 cursor-pointer" onClick={() => navigate('home')}>
            <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>UIU HealthCare</span>
          </div>

          <div className="flex flex-col gap-2">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: activeTab === item.id ? 'rgba(37,99,235,0.1)' : 'transparent', textAlign: 'left' }}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-800 pt-4 mt-4">
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }} onClick={() => navigate('forum')}>
            <MessageSquare size={20} color="#BEF264" />
            <span className="text-white">Community Forum</span>
          </button>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }} onClick={() => navigate('blood-donors')}>
            <Droplet size={20} color="#EF4444" fill="#EF4444" />
            <span className="text-white">Blood Donors</span>
          </button>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }} onClick={() => navigate('emergency')}>
            <AlertTriangle size={20} color="#EF4444" />
            <span className="text-red-500 font-bold">Emergency SOS</span>
          </button>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }} onClick={onLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 sticky top-0 z-30">
          <div className="relative w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search records, doctors..." className="input pl-10 bg-slate-50 border-none" />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <div className="notification-dot absolute top-1 right-1" />
            </button>
            <div className="flex items-center gap-3">
              {user?.image ? (
                <img src={user.image} alt={user.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="avatar bg-blue-100 text-blue-600">{user?.name?.charAt(0) || 'U'}</div>
              )}
              <div>
                <div className="font-bold text-sm text-slate-800">{user?.name || 'Patient'}</div>
                <div className="text-xs text-slate-500">Patient</div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
              
              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="stat-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Calendar size={24} /></div>
                    <span className="badge badge-blue">Upcoming</span>
                  </div>
                  <div className="text-3xl font-black text-slate-800">{appointments.filter(a => a.status === 'Upcoming').length}</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Appointments</div>
                </div>
                <div className="stat-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><FileText size={24} /></div>
                  </div>
                  <div className="text-3xl font-black text-slate-800">{healthRecords.length}</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Health Records</div>
                </div>
                <div className="stat-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Pill size={24} /></div>
                    <span className="badge badge-green">Active</span>
                  </div>
                  <div className="text-3xl font-black text-slate-800">0</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Prescriptions</div>
                </div>
                <div className="stat-card border-none gradient-primary text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/20 rounded-xl"><Activity size={24} /></div>
                  </div>
                  <div className="text-3xl font-black">98</div>
                  <div className="text-sm text-white/80 font-medium mt-1">Health Score</div>
                </div>
              </div>

              {/* Quick Actions */}
              <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <button className="card p-6 flex items-center gap-4 hover:border-blue-500 group" onClick={() => navigate('doctors')}>
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Stethoscope size={24} /></div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800">Book Appointment</div>
                    <div className="text-sm text-slate-500">Find a doctor</div>
                  </div>
                </button>
                <button className="card p-6 flex items-center gap-4 hover:border-purple-500 group" onClick={() => navigate('ai-assistant')}>
                  <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform"><Activity size={24} /></div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800">Symptom Checker</div>
                    <div className="text-sm text-slate-500">Automated health analysis</div>
                  </div>
                </button>
                <button className="card p-6 flex items-center gap-4 hover:border-green-500 group" onClick={() => setActiveTab('records')}>
                  <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800">Upload Records</div>
                    <div className="text-sm text-slate-500">Add lab reports</div>
                  </div>
                </button>
              </div>

              {/* Upcoming Appointment */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">Next Appointment</h2>
                  <button className="btn btn-ghost btn-sm text-blue-600" onClick={() => setActiveTab('appointments')}>View All</button>
                </div>
                {loadingAppts ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#64748B' }}>Loading appointments...</div>
                ) : nextAppointment ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {nextAppointment.doctor_name ? nextAppointment.doctor_name.split(' ').slice(-1)[0].charAt(0) : 'D'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{nextAppointment.doctor_name || 'Doctor'}</div>
                        <div className="text-sm text-slate-500">{nextAppointment.specialty || ''} • {nextAppointment.type}</div>
                      </div>
                    </div>
                    <div className="flex gap-6 items-center">
                      <div className="text-right">
                        <div className="font-bold text-slate-800 flex items-center gap-2 justify-end"><Calendar size={14} className="text-slate-400" /> {nextAppointment.date}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-2 justify-end"><Clock size={14} className="text-slate-400" /> {nextAppointment.time}</div>
                      </div>
                      {nextAppointment.type === 'Video Call' && (
                        <button className="btn btn-primary btn-sm flex items-center gap-2"><Video size={16} /> Join Call</button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: 'center', color: '#64748B' }}>No upcoming appointments.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Appointments</h1>
                <button className="btn btn-primary" onClick={() => navigate('doctors')}>Book New</button>
              </div>
              
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Ref Code</th>
                      <th>Doctor</th>
                      <th>Type</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAppts ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>Loading...</td></tr>
                    ) : appointments.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No appointments found.</td></tr>
                    ) : appointments.map((apt) => (
                      <tr key={apt.id}>
                        <td className="font-mono text-xs font-semibold text-slate-500">{apt.ref_code || 'N/A'}</td>
                        <td>
                          <div className="font-bold text-slate-800">{apt.doctor_name}</div>
                          <div className="text-xs text-slate-500">{apt.specialty}</div>
                        </td>
                        <td>
                          <span className="flex items-center gap-1.5 text-sm">
                            {apt.type === 'Video Call' ? <Video size={14} className="text-blue-500" /> : <MapPin size={14} className="text-green-500" />}
                            {apt.type}
                          </span>
                        </td>
                        <td className="text-slate-600 text-sm">{apt.date} at {apt.time}</td>
                        <td>
                          <span className={`badge ${apt.status === 'Upcoming' ? 'badge-blue' : apt.status === 'Cancelled' ? 'badge-red' : 'badge-gray'}`} style={{
                            background: apt.status === 'Cancelled' ? '#FEE2E2' : undefined,
                            color: apt.status === 'Cancelled' ? '#EF4444' : undefined
                          }}>{apt.status}</span>
                        </td>
                        <td>
                          {apt.status === 'Upcoming' ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button 
                                className="btn btn-outline btn-sm" 
                                style={{ borderColor: '#EF4444', color: '#EF4444', fontWeight: 600 }} 
                                onClick={() => handleCancelAppointment(apt.id)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button className="btn btn-outline btn-sm">View Details</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cancel Appointment by Reference Form */}
              <div className="card p-6 mt-8 border border-slate-200 bg-white" style={{ maxWidth: 500 }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#0F172A' }}>Cancel Appointment by Reference</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                      Appointment Reference Code
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. APT-1001" 
                      value={cancelRef} 
                      onChange={e => {
                        setCancelRef(e.target.value);
                        setCancelError('');
                        setCancelSuccess('');
                      }} 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                    />
                  </div>
                  
                  {cancelError && (
                    <div style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 600 }}>
                      {cancelError}
                    </div>
                  )}

                  {cancelSuccess && (
                    <div style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 600 }}>
                      {cancelSuccess}
                    </div>
                  )}

                  <button 
                    className="btn btn-outline" 
                    style={{ borderColor: '#EF4444', color: '#EF4444', fontWeight: 600, width: '100%' }}
                    onClick={handleCancelByRef}
                  >
                    Cancel Appointment
                  </button>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'records' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Health Records</h1>
                <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>+ Upload Record</button>
              </div>
              
              {loadingRecords ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#64748B' }}>Loading records...</div>
              ) : healthRecords.length === 0 ? (
                 <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', background: 'var(--card-bg)', borderRadius: 16 }}>No health records found.</div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {healthRecords.map((rec) => {
                    const RecIcon = iconMap[rec.type] || FileText;
                    return (
                      <div key={rec.id} className="card p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedRecord(rec)}>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl bg-blue-50 text-blue-500`}><RecIcon size={20} /></div>
                          {rec.file_url && (
                             <a href={`http://localhost:5000${rec.file_url}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors" onClick={(e) => { e.stopPropagation(); }}><Download size={18} /></a>
                          )}
                        </div>
                        <div className="font-bold text-slate-800 mb-1">{rec.title}</div>
                        <div className="flex justify-between items-center mt-4 text-xs">
                          <span className="text-slate-500">{rec.date}</span>
                          <span className="badge badge-gray">{rec.type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload Modal */}
              {showUploadModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                  <div className="card p-6 animate-fade-in" style={{ width: '100%', maxWidth: '440px', borderRadius: 16, border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>Upload Medical Record</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Record Title</label>
                        <input className="input" placeholder="e.g. Blood Sugar Report" value={newRecord.title} onChange={e => setNewRecord(n => ({ ...n, title: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Record Type</label>
                        <select className="input" value={newRecord.type} onChange={e => setNewRecord(n => ({ ...n, type: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}>
                          <option value="Lab Result">Lab Result</option>
                          <option value="Radiology">Radiology</option>
                          <option value="Immunization">Immunization</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Select File</label>
                        <input type="file" onChange={e => setNewRecord(n => ({ ...n, file: e.target.files[0] }))} style={{ display: 'block', width: '100%', padding: '8px', border: '1px dashed #CBD5E1', borderRadius: '8px' }} />
                      </div>
                    </div>

                    {uploadError && (
                      <div style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 600, marginTop: '12px' }}>
                        {uploadError}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" onClick={() => { setShowUploadModal(false); setUploadError(''); }}>Cancel</button>
                      <button className="btn btn-primary" onClick={handleUploadRecord}>Upload Record</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Detail View Modal */}
              {selectedRecord && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                  <div className="card p-6 animate-fade-in" style={{ width: '100%', maxWidth: '400px', borderRadius: 16, border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>{selectedRecord.title}</h3>
                    <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '16px' }}>Uploaded on {selectedRecord.date}</p>
                    <div style={{ background: '#F1F5F9', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', color: '#334155', marginBottom: '20px' }}>
                      <strong>Type:</strong> {selectedRecord.type}
                    </div>
                    {selectedRecord.file_url && (
                        <div style={{ marginBottom: 20 }}>
                          <a href={`http://localhost:5000${selectedRecord.file_url}`} target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}>View Attachment</a>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" onClick={() => setSelectedRecord(null)}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">My Prescriptions</h1>

              {loadingPres ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#64748B' }}>Loading prescriptions...</div>
              ) : prescriptions.length === 0 ? (
                <div className="card p-8 text-center bg-white border border-slate-200">
                  <Pill size={48} style={{ color: '#CBD5E1', margin: '0 auto 16px' }} />
                  <p style={{ color: '#64748B', fontSize: '1.1rem' }}>No prescriptions found.</p>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: 8 }}>Your doctor hasn't uploaded any prescriptions for you yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {prescriptions.map((rx) => {
                    let meds = [];
                    try {
                      meds = JSON.parse(rx.medications);
                    } catch (e) {
                      meds = [];
                    }
                    return (
                      <div key={rx.id} className="card p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 style={{ fontWeight: 700, color: '#1E293B' }}>{rx.doctor_name || 'Dr. Aisha Rahman'}</h3>
                              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>{rx.specialty || 'General Practitioner'}</p>
                              <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{rx.hospital || 'UIU HealthCare Centre'}</p>
                            </div>
                            <span style={{ fontSize: '0.75rem', background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '100px', fontWeight: 600 }}>
                              RX-{rx.id}
                            </span>
                          </div>
                          
                          <div style={{ borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '12px 0', margin: '12px 0' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Diagnosis:</div>
                            <div style={{ fontSize: '0.9rem', color: '#1E293B', marginBottom: '12px' }}>{rx.diagnosis}</div>

                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Medications:</div>
                            <div className="flex flex-col gap-1.5">
                              {meds.map((m, idx) => (
                                <div key={idx} style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', justify: 'space-between', justifyContent: 'space-between' }}>
                                  <span>💊 {m.name}</span>
                                  <span style={{ fontWeight: 600, color: '#64748B' }}>{m.dosage} ({m.duration})</span>
                                </div>
                              ))}
                            </div>
                            
                            {rx.suggested_tests && (
                              <>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginTop: '12px', marginBottom: '6px' }}>Suggested Tests:</div>
                                <div style={{ fontSize: '0.85rem', color: '#1E293B', padding: '8px', background: '#FEF3C7', borderRadius: '6px', border: '1px solid #FDE68A', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <Activity size={14} className="text-amber-600" />
                                  <span className="font-semibold text-amber-700">{rx.suggested_tests}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            Date: {new Date(rx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <button 
                            className="btn btn-primary btn-sm flex items-center gap-1.5"
                            onClick={() => printPrescription(rx)}
                          >
                            <Download size={14} /> Download / Print PDF
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MEDICAL TESTS */}
          {activeTab === 'tests' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">Medical Tests & Billing</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Book Test Form */}
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-4 text-slate-800">Book a New Test</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">Select Hospital</label>
                      <select 
                        className="input w-full"
                        value={testForm.hospitalId}
                        onChange={(e) => setTestForm({...testForm, hospitalId: e.target.value})}
                      >
                        <option value="">-- Choose a Hospital --</option>
                        {hospitals.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">Select Test</label>
                      <select 
                        className="input w-full"
                        value={testForm.testName}
                        onChange={(e) => {
                          const val = e.target.value;
                          let fee = 0;
                          if(val === 'Complete Blood Count (CBC)') fee = 1000;
                          if(val === 'Chest X-Ray') fee = 800;
                          if(val === 'MRI Brain') fee = 8000;
                          if(val === 'ECG') fee = 600;
                          setTestForm({...testForm, testName: val, fee});
                        }}
                      >
                        <option value="">-- Choose a Test --</option>
                        <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC) - ৳1000</option>
                        <option value="Chest X-Ray">Chest X-Ray - ৳800</option>
                        <option value="MRI Brain">MRI Brain - ৳8000</option>
                        <option value="ECG">ECG - ৳600</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">Insurance Company (Optional)</label>
                      <select 
                        className="input w-full"
                        value={testForm.insuranceCompany}
                        onChange={(e) => setTestForm({...testForm, insuranceCompany: e.target.value})}
                      >
                        <option value="">No Insurance (Full Payment)</option>
                        <option value="MetLife Bangladesh">MetLife Bangladesh (Up to 40% Off)</option>
                        <option value="Delta Life Insurance">Delta Life Insurance (Up to 40% Off)</option>
                        <option value="Green Delta Insurance">Green Delta Insurance (Up to 40% Off)</option>
                      </select>
                    </div>

                    {testForm.insuranceCompany && (
                      <div className="animate-fade-in">
                        <label className="text-sm font-bold text-slate-600 block mb-2">Policy Number</label>
                        <input 
                          type="text" 
                          className="input w-full" 
                          placeholder="Enter your policy number..."
                          value={testForm.policyNumber}
                          onChange={(e) => setTestForm({...testForm, policyNumber: e.target.value})}
                        />
                      </div>
                    )}

                    {testForm.testName && testForm.hospitalId && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-600">Base Fee:</span>
                          <span className="font-bold">৳{testForm.fee}</span>
                        </div>
                        {testForm.insuranceCompany && testForm.policyNumber.length > 3 ? (
                          <div className="flex justify-between mb-2 text-green-600">
                            <span>Insurance Discount (40%):</span>
                            <span className="font-bold">- ৳{testForm.fee * 0.4}</span>
                          </div>
                        ) : testForm.insuranceCompany && (
                          <div className="text-xs text-red-500 mb-2">Please enter a valid policy number to apply discount.</div>
                        )}
                        
                        <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                          <span className="font-black text-lg">Total Payable:</span>
                          <span className="font-black text-lg text-blue-600">
                            ৳{(testForm.insuranceCompany && testForm.policyNumber.length > 3) ? testForm.fee * 0.6 : testForm.fee}
                          </span>
                        </div>
                      </div>
                    )}

                    {testSuccess && <div className="text-green-600 font-bold bg-green-50 p-3 rounded-lg mt-2">{testSuccess}</div>}

                    <button 
                      className="btn btn-primary mt-2" 
                      disabled={!testForm.testName || !testForm.hospitalId}
                      onClick={async () => {
                        if (testForm.insuranceCompany && testForm.policyNumber.length < 4) {
                          alert("Please enter a valid policy number!");
                          return;
                        }
                        try {
                          const finalFee = (testForm.insuranceCompany && testForm.policyNumber.length > 3) ? testForm.fee * 0.6 : testForm.fee;
                          const token = localStorage.getItem('token');
                          await API.post('/api/tests/book', {
                            hospital_id: testForm.hospitalId,
                            test_name: testForm.testName,
                            insurance_company: testForm.insuranceCompany,
                            policy_number: testForm.policyNumber,
                            total_fee: finalFee
                          }, { headers: { Authorization: `Bearer ${token}` }});
                          
                          setTestSuccess(`Successfully booked ${testForm.testName}! Please visit the hospital to submit sample.`);
                          fetchDashboardData();
                          setTimeout(() => {
                            setTestSuccess('');
                            setTestForm({ testName: '', hospitalId: '', insuranceCompany: '', policyNumber: '', fee: 0 });
                          }, 4000);
                        } catch (err) {
                          alert("Failed to book test.");
                        }
                      }}
                    >
                      Pay & Book Test
                    </button>
                  </div>
                </div>

                {/* Booked Tests History */}
                <div>
                  <h3 className="font-bold text-lg mb-4 text-slate-800">My Booked Tests</h3>
                  <div className="flex flex-col gap-4">
                    {myTests.map((t, i) => (
                      <div key={i} className="card p-4 flex flex-col gap-2 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-lg text-slate-800">{t.test_name}</div>
                            <div className="text-sm text-slate-500">Hospital: <span className="font-semibold text-slate-700">{t.hospital_name}</span></div>
                          </div>
                          <span className={`badge ${t.status === 'Completed' ? 'badge-green' : t.status === 'Pending' ? 'badge-blue' : 'badge-gray'}`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-slate-500">Date: {new Date(t.created_at).toLocaleDateString()}</div>
                            <div className="font-bold text-blue-600">Paid: ৳{t.total_fee}</div>
                          </div>
                          <button 
                            className="btn btn-outline btn-sm w-full flex items-center justify-center gap-1.5 mt-1"
                            onClick={() => printTestInvoice(t)}
                          >
                            <Download size={14} /> Download PDF Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                    {myTests.length === 0 && (
                      <div className="card p-8 text-center text-slate-500">
                        No medical tests booked yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insurance' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Insurance Claims</h1>
                <button className="btn btn-primary" onClick={() => setShowClaimModal(true)}>Submit New Claim</button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Claim Title</th>
                      <th>Description</th>
                      <th>Attached Record</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingClaims ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>Loading claims...</td></tr>
                    ) : claims.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No claims submitted yet.</td></tr>
                    ) : claims.map((claim) => (
                      <tr key={claim.id}>
                        <td className="font-bold text-slate-800">{claim.title}</td>
                        <td className="text-sm text-slate-600">{claim.description || '—'}</td>
                        <td>
                          {claim.file_url ? (
                            <a href={`http://localhost:5000${claim.file_url}`} target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}>
                              {claim.record_title || 'View Bill'}
                            </a>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="font-bold text-slate-900">৳{parseFloat(claim.amount).toLocaleString()}</td>
                        <td className="text-sm text-slate-500">{new Date(claim.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${
                            claim.status === 'Approved' ? 'badge-green' :
                            claim.status === 'Rejected' ? 'badge-red' : 'badge-blue'
                          }`} style={{
                            background: claim.status === 'Rejected' ? '#FEE2E2' : undefined,
                            color: claim.status === 'Rejected' ? '#EF4444' : undefined
                          }}>{claim.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Submit Claim Modal */}
              {showClaimModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                  <div className="card p-6 animate-fade-in" style={{ width: '100%', maxWidth: '440px', borderRadius: 16, border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>Submit Insurance Claim</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Claim Title</label>
                        <input className="input" placeholder="e.g. Heart Checkup Reimbursement" value={newClaim.title} onChange={e => setNewClaim(c => ({ ...c, title: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Description</label>
                        <textarea className="input" placeholder="Describe why you are claiming this amount..." value={newClaim.description} onChange={e => setNewClaim(c => ({ ...c, description: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', minHeight: 80 }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Claim Amount (BDT)</label>
                        <input type="number" className="input" placeholder="e.g. 5000" value={newClaim.amount} onChange={e => setNewClaim(c => ({ ...c, amount: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Attach Supporting Document (from Health Records)</label>
                        <select className="input" value={newClaim.record_id} onChange={e => {
                          const val = e.target.value;
                          const matched = healthRecords.find(r => r.id === parseInt(val));
                          setNewClaim(c => ({
                            ...c,
                            record_id: val,
                            title: c.title || (matched ? `Reimbursement for ${matched.title}` : '')
                          }));
                        }} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}>
                          <option value="">-- Select a record --</option>
                          {healthRecords.map(rec => (
                            <option key={rec.id} value={rec.id}>{rec.title} ({rec.type})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {claimError && (
                      <div style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 600, marginTop: '12px' }}>
                        {claimError}
                      </div>
                    )}

                    {claimSuccess && (
                      <div style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 600, marginTop: '12px' }}>
                        {claimSuccess}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" onClick={() => { setShowClaimModal(false); setClaimError(''); }}>Cancel</button>
                      <button className="btn btn-primary" onClick={handleCreateClaim}>Submit Claim</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wellness' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Mental Wellness</h1>
                  <p className="text-slate-500 mt-1">Access clinical screening tools, guided exercises, and mindfulness sessions.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6 border-t-4 border-purple-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                      <Brain size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">PHQ-9 Screening</h3>
                      <p className="text-xs text-slate-500">Depression Assessment</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">Standardized clinical assessment tool to evaluate depression severity.</p>
                  <button onClick={() => setActiveWellnessModal('phq9')} className="btn w-full" style={{ background: '#F3E8FF', color: '#7C3AED', fontWeight: 600 }}>Start Assessment</button>
                </div>

                <div className="card p-6 border-t-4 border-amber-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">GAD-7 Screening</h3>
                      <p className="text-xs text-slate-500">Anxiety Assessment</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">Screening tool to identify and measure generalized anxiety disorder.</p>
                  <button onClick={() => setActiveWellnessModal('gad7')} className="btn w-full" style={{ background: '#FEF3C7', color: '#D97706', fontWeight: 600 }}>Start Assessment</button>
                </div>

                <div className="card p-6 border-t-4 border-emerald-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Heart size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Guided Breathing</h3>
                      <p className="text-xs text-slate-500">Stress Relief</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">Interactive 4-7-8 and box breathing routines to lower heart rate.</p>
                  <button onClick={() => setActiveWellnessModal('breathing')} className="btn w-full" style={{ background: '#D1FAE5', color: '#059669', fontWeight: 600 }}>Start Session</button>
                </div>
                <div className="card p-6 border-t-4 border-pink-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                      <Smile size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Daily Mood Journal</h3>
                      <p className="text-xs text-slate-500">Emotional Tracking</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">Track your emotional patterns over time with private analytics.</p>
                  <button onClick={() => setActiveWellnessModal('mood')} className="btn w-full" style={{ background: '#FDF2F8', color: '#DB2777', fontWeight: 600 }}>Open Journal</button>
                </div>

                <div className="card p-6 border-t-4 border-blue-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <Music size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Meditation Sessions</h3>
                      <p className="text-xs text-slate-500">Mindfulness Audio</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">Audio sessions ranging from 5 to 30 minutes for mindfulness.</p>
                  <button onClick={() => setActiveWellnessModal('meditation')} className="btn w-full" style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: 600 }}>Start Session</button>
                </div>
              </div>
              
              <div className="card p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold mb-2">Connect with a Professional</h3>
                  <p className="opacity-90 max-w-md">Our verified psychiatrists and clinical psychologists are available 24/7 for private video consultations.</p>
                </div>
                <button onClick={() => navigate('doctors')} className="btn bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                  Find a Therapist
                </button>
              </div>
            </div>
          )}
          {/* ── Wellness Modals ── */}
          {activeWellnessModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="card p-6 animate-fade-in" style={{ width: '100%', maxWidth: '500px', borderRadius: 16, border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
                    {activeWellnessModal === 'phq9' ? 'PHQ-9 Depression Assessment' :
                     activeWellnessModal === 'gad7' ? 'GAD-7 Anxiety Assessment' :
                     activeWellnessModal === 'mood' ? 'Daily Mood Journal' :
                     activeWellnessModal === 'meditation' ? 'Meditation Session' :
                     'Guided Breathing Session'}
                  </h3>
                  <button className="btn btn-ghost" onClick={() => setActiveWellnessModal(null)}>
                    <X size={20} />
                  </button>
                </div>
                
                {activeWellnessModal === 'phq9' && <PHQ9Assessment onClose={() => setActiveWellnessModal(null)} />}
                {activeWellnessModal === 'gad7' && <GAD7Assessment onClose={() => setActiveWellnessModal(null)} />}
                {activeWellnessModal === 'breathing' && <GuidedBreathing onClose={() => setActiveWellnessModal(null)} />}
                {activeWellnessModal === 'mood' && <DailyMoodJournal onClose={() => setActiveWellnessModal(null)} />}
                {activeWellnessModal === 'meditation' && <MeditationSessions onClose={() => setActiveWellnessModal(null)} />}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PHQ9Assessment({ onClose }) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const questions = [
    "Little interest or pleasure in doing things?",
    "Feeling down, depressed, or hopeless?",
    "Trouble falling or staying asleep, or sleeping too much?",
    "Feeling tired or having little energy?",
    "Poor appetite or overeating?",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
    "Trouble concentrating on things, such as reading the newspaper or watching television?",
    "Moving or speaking so slowly that other people could have noticed?",
    "Thoughts that you would be better off dead, or of hurting yourself?"
  ];
  
  if (step >= questions.length) {
    let severity = score <= 4 ? "Minimal Depression" : score <= 9 ? "Mild Depression" : score <= 14 ? "Moderate Depression" : score <= 19 ? "Moderately Severe" : "Severe Depression";
    return (
      <div className="text-center py-6">
        <h4 className="text-xl font-bold mb-2">Assessment Complete</h4>
        <div className="text-4xl font-bold text-purple-600 mb-4">{score} <span className="text-lg text-slate-400">/ 27</span></div>
        <p className="text-slate-600 mb-6">Clinical Severity: <strong className="text-slate-800">{severity}</strong></p>
        <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          * This is a screening tool, not a diagnostic instrument. If you are concerned about your results or feeling overwhelmed, please book a consultation with one of our verified therapists.
        </p>
        <button onClick={onClose} className="btn bg-purple-600 text-white w-full py-3 rounded-xl font-bold">Finish & Close</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 text-xs text-slate-500 font-bold uppercase tracking-wider">Question {step + 1} of 9</div>
      <h4 className="text-lg font-bold text-slate-800 mb-6 leading-relaxed">"Over the last 2 weeks, how often have you been bothered by: <br/><br/><span className="text-purple-600">{questions[step]}</span>"</h4>
      <div className="flex flex-col gap-3">
        {[
          { label: 'Not at all', val: 0 },
          { label: 'Several days', val: 1 },
          { label: 'More than half the days', val: 2 },
          { label: 'Nearly every day', val: 3 },
        ].map(opt => (
          <button key={opt.label} onClick={() => { setScore(s => s + opt.val); setStep(s => s + 1); }} 
            className="text-left px-5 py-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 transition-colors font-semibold text-slate-700 shadow-sm">
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function GAD7Assessment({ onClose }) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const questions = [
    "Feeling nervous, anxious or on edge?",
    "Not being able to stop or control worrying?",
    "Worrying too much about different things?",
    "Trouble relaxing?",
    "Being so restless that it is hard to sit still?",
    "Becoming easily annoyed or irritable?",
    "Feeling afraid as if something awful might happen?"
  ];
  
  if (step >= questions.length) {
    let severity = score <= 4 ? "Minimal Anxiety" : score <= 9 ? "Mild Anxiety" : score <= 14 ? "Moderate Anxiety" : "Severe Anxiety";
    return (
      <div className="text-center py-6">
        <h4 className="text-xl font-bold mb-2">Assessment Complete</h4>
        <div className="text-4xl font-bold text-amber-500 mb-4">{score} <span className="text-lg text-slate-400">/ 21</span></div>
        <p className="text-slate-600 mb-6">Clinical Severity: <strong className="text-slate-800">{severity}</strong></p>
        <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          * This is a screening tool, not a diagnostic instrument. If you are concerned about your results or feeling overwhelmed, please book a consultation with one of our verified therapists.
        </p>
        <button onClick={onClose} className="btn bg-amber-500 text-white w-full py-3 rounded-xl font-bold">Finish & Close</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 text-xs text-slate-500 font-bold uppercase tracking-wider">Question {step + 1} of 7</div>
      <h4 className="text-lg font-bold text-slate-800 mb-6 leading-relaxed">"Over the last 2 weeks, how often have you been bothered by: <br/><br/><span className="text-amber-600">{questions[step]}</span>"</h4>
      <div className="flex flex-col gap-3">
        {[
          { label: 'Not at all', val: 0 },
          { label: 'Several days', val: 1 },
          { label: 'More than half the days', val: 2 },
          { label: 'Nearly every day', val: 3 },
        ].map(opt => (
          <button key={opt.label} onClick={() => { setScore(s => s + opt.val); setStep(s => s + 1); }} 
            className="text-left px-5 py-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 transition-colors font-semibold text-slate-700 shadow-sm">
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function GuidedBreathing({ onClose }) {
  const [phase, setPhase] = useState('Inhale');
  const [timer, setTimer] = useState(4);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    
    const interval = setInterval(() => {
      setTimer(t => {
        if (t > 1) return t - 1;
        
        // State machine
        if (phase === 'Inhale') {
          setPhase('Hold');
          return 7;
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          return 8;
        } else {
          setPhase('Inhale');
          return 4;
        }
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [active, phase]);

  return (
    <div className="text-center py-6">
      <h4 className="text-xl font-bold mb-2">4-7-8 Breathing</h4>
      <p className="text-sm text-slate-500 mb-8">A clinically proven rhythm to reduce anxiety and help you sleep.</p>
      
      <div className="relative w-48 h-48 mx-auto mb-10 flex items-center justify-center">
        {/* Animated outer ring */}
        <div 
          className="absolute inset-0 rounded-full bg-emerald-100 opacity-50"
          style={{
            transform: `scale(${phase === 'Inhale' ? 1.5 : phase === 'Hold' ? 1.5 : 1})`,
            transition: phase === 'Inhale' ? 'transform 4s linear' : phase === 'Exhale' ? 'transform 8s linear' : 'none'
          }}
        />
        {/* Inner static ring */}
        <div className="relative w-32 h-32 rounded-full bg-emerald-500 shadow-lg flex flex-col items-center justify-center text-white z-10 border-4 border-emerald-400">
          <div className="text-sm font-bold uppercase tracking-widest opacity-90">{active ? phase : 'Ready'}</div>
          <div className="text-4xl font-black mt-1">{active ? timer : '—'}</div>
        </div>
      </div>
      
      {!active ? (
        <button onClick={() => { setActive(true); setPhase('Inhale'); setTimer(4); }} className="btn bg-emerald-500 text-white w-full py-3 rounded-xl font-bold mb-3 shadow-md hover:bg-emerald-600">Start Session</button>
      ) : (
        <button onClick={() => setActive(false)} className="btn btn-outline border-slate-300 text-slate-600 w-full py-3 rounded-xl font-bold mb-3 hover:bg-slate-50">Stop Session</button>
      )}
      <button onClick={onClose} className="btn btn-ghost text-slate-500 w-full font-semibold">Close Tool</button>
    </div>
  );
}

function DailyMoodJournal({ onClose }) {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <div className="text-center py-6 animate-fade-in">
        <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smile size={32} />
        </div>
        <h4 className="text-xl font-bold mb-2">Journal Entry Saved!</h4>
        <p className="text-sm text-slate-500 mb-6">Your mood has been logged securely. Tracking your emotions daily helps identify patterns and triggers.</p>
        <button onClick={onClose} className="btn bg-pink-500 hover:bg-pink-600 text-white w-full py-3 rounded-xl font-bold">Close Journal</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <p className="text-sm text-slate-500 mb-4 font-medium">How are you feeling today?</p>
      <div className="flex justify-between gap-2 mb-6">
        {[
          { emoji: '😭', label: 'Awful', val: 1 },
          { emoji: '😞', label: 'Bad', val: 2 },
          { emoji: '😐', label: 'Okay', val: 3 },
          { emoji: '🙂', label: 'Good', val: 4 },
          { emoji: '🤩', label: 'Great', val: 5 }
        ].map(m => (
          <button 
            key={m.label}
            onClick={() => setMood(m.val)}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${mood === m.val ? 'border-pink-500 bg-pink-50 scale-105' : 'border-slate-100 hover:border-pink-200 hover:bg-slate-50'}`}
          >
            <span className="text-3xl mb-1">{m.emoji}</span>
            <span className={`text-xs font-bold ${mood === m.val ? 'text-pink-600' : 'text-slate-500'}`}>{m.label}</span>
          </button>
        ))}
      </div>
      
      <p className="text-sm text-slate-500 mb-2 font-medium">Add a private note (optional)</p>
      <textarea 
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all mb-6"
        placeholder="What's making you feel this way today?"
        rows="3"
      />
      
      <button 
        disabled={!mood}
        onClick={() => setSaved(true)} 
        className={`btn w-full py-3 rounded-xl font-bold text-white transition-all ${mood ? 'bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-200' : 'bg-slate-300 cursor-not-allowed'}`}
      >
        Save Entry
      </button>
    </div>
  );
}

function MeditationSessions({ onClose }) {
  const [playing, setPlaying] = useState(null);
  
  const sessions = [
    { id: 1, title: '5-Minute Morning Reset', duration: '5 min', type: 'Mindfulness', color: '#3B82F6', bg: '#EFF6FF', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 2, title: 'Deep Sleep Relaxation', duration: '20 min', type: 'Sleep', color: '#6366F1', bg: '#EEF2FF', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
    { id: 3, title: 'Anxiety Relief Breathing', duration: '10 min', type: 'Focus', color: '#10B981', bg: '#ECFDF5', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
  ];

  return (
    <div className="animate-fade-in">
      <p className="text-sm text-slate-500 mb-6">Select a guided meditation session to begin. Audio will play securely in your browser.</p>
      
      <div className="flex flex-col gap-4 mb-6">
        {sessions.map(s => (
          <div key={s.id} className={`border-2 rounded-xl p-4 flex flex-col transition-all ${playing === s.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: s.bg, color: s.color }}>
                  <Music size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{s.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{s.type} • {s.duration}</p>
                </div>
              </div>
              
              {playing === s.id ? (
                <button onClick={() => setPlaying(null)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md animate-pulse">
                  Stop
                </button>
              ) : (
                <button onClick={() => setPlaying(s.id)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  Play
                </button>
              )}
            </div>

            {/* Real Audio Player rendering when this specific session is selected */}
            {playing === s.id && (
              <div className="mt-4 animate-fade-in">
                <audio 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full"
                  src={s.audio}
                  style={{ height: '36px' }}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button onClick={onClose} className="btn btn-ghost w-full font-semibold text-slate-500">Close Library</button>
    </div>
  );
}
