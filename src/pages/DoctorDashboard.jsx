import React, { useState, useEffect } from 'react';
import {
  Heart, Users, Calendar, FileText, Pill, DollarSign,
  LogOut, Search, Bell, Clock, Video, CheckCircle, XCircle,
  AlertCircle, RefreshCw, User, Download, Plus, Trash2, Eye, FileUp
} from 'lucide-react';
import API from '../api';

export default function DoctorDashboard({ user, onLogout, navigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [loadingApts, setLoadingApts] = useState(false);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });

  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPres, setLoadingPres] = useState(false);
  const [showPresModal, setShowPresModal] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionSuccess, setPrescriptionSuccess] = useState('');
  const [newPres, setNewPres] = useState({
    patient_id: '',
    diagnosis: '',
    medications: [],
    advice: '',
    suggested_tests: ''
  });
  const [selectedPatientForReports, setSelectedPatientForReports] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [loadingPatientReports, setLoadingPatientReports] = useState(false);
  const [newReportForm, setNewReportForm] = useState({ title: '', type: 'Lab Result', file: null });
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportError, setReportError] = useState('');

  const [medInput, setMedInput] = useState({
    name: '',
    dosage: '1+0+1',
    instruction: 'After Food',
    duration: '7 Days'
  });

  const navItems = [
    { id: 'overview',       label: 'Overview',        icon: Users },
    { id: 'appointments',   label: 'Appointments',    icon: Calendar },
    { id: 'patients',       label: 'My Patients',     icon: FileText },
    { id: 'prescriptions',  label: 'Prescriptions',   icon: Pill },
    { id: 'earnings',       label: 'Earnings',        icon: DollarSign },
  ];

  const fetchPrescriptions = async () => {
    setLoadingPres(true);
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/api/prescriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoadingPres(false);
    }
  };

  const fetchPatientReports = async (patientId) => {
    try {
      setLoadingPatientReports(true);
      const token = localStorage.getItem('token');
      const res = await API.get(`/api/records?patient_id=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch patient reports:', err);
    } finally {
      setLoadingPatientReports(false);
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');
    if (!newReportForm.title || !newReportForm.file) {
      setReportError('Please fill out all fields and select a file.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newReportForm.title);
      formData.append('type', newReportForm.type);
      formData.append('file', newReportForm.file);
      formData.append('patient_id', selectedPatientForReports.id);

      await API.post('/api/records', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setReportSuccess('Report uploaded successfully!');
      setNewReportForm({ title: '', type: 'Lab Result', file: null });
      fetchPatientReports(selectedPatientForReports.id);
    } catch (err) {
      setReportError(err.response?.data?.error || 'Failed to upload report.');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/api/records/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPatientReports(selectedPatientForReports.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete report.');
    }
  };

  const handleAddMedication = () => {
    if (!medInput.name.trim()) return;
    setNewPres(prev => ({
      ...prev,
      medications: [...prev.medications, { ...medInput }]
    }));
    setMedInput({
      name: '',
      dosage: '1+0+1',
      instruction: 'After Food',
      duration: '7 Days'
    });
  };

  const handleRemoveMedication = (index) => {
    setNewPres(prev => ({
      ...prev,
      medications: prev.medications.filter((_, idx) => idx !== index)
    }));
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setPrescriptionError('');
    setPrescriptionSuccess('');

    if (!newPres.patient_id) {
      setPrescriptionError('Please select a patient.');
      return;
    }
    if (!newPres.diagnosis.trim()) {
      setPrescriptionError('Please enter a diagnosis.');
      return;
    }
    if (newPres.medications.length === 0) {
      setPrescriptionError('Please add at least one medication.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await API.post('/api/prescriptions', {
        patient_id: newPres.patient_id,
        diagnosis: newPres.diagnosis,
        medications: JSON.stringify(newPres.medications),
        advice: newPres.advice,
        suggested_tests: newPres.suggested_tests
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPrescriptionSuccess('Prescription issued successfully!');
      setNewPres({
        patient_id: '',
        diagnosis: '',
        medications: [],
        advice: '',
        suggested_tests: ''
      });
      fetchPrescriptions();
      setTimeout(() => {
        setShowPresModal(false);
        setPrescriptionSuccess('');
      }, 1500);
    } catch (err) {
      setPrescriptionError(err.response?.data?.error || 'Failed to issue prescription.');
    }
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

  const fetchAppointments = async () => {
    setLoadingApts(true);
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/api/appointments/doctor', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const apts = res.data || [];
      setAppointments(apts);
      setStats({
        total: apts.length,
        upcoming: apts.filter(a => a.status === 'Upcoming').length,
        completed: apts.filter(a => a.status === 'Completed').length,
      });
    } catch (err) {
      console.error('Failed to fetch doctor appointments:', err);
    } finally {
      setLoadingApts(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await API.put(`/api/appointments/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAppointments();
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPrescriptions();
  }, []);

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
                onClick={() => { setActiveTab(item.id); if (item.id === 'appointments') fetchAppointments(); }}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: activeTab === item.id ? 'rgba(37,99,235,0.1)' : 'transparent', textAlign: 'left' }}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-800 pt-4">
          <div className="px-4 py-2">
            <div className="text-white font-bold text-sm">{user?.name || 'Doctor'}</div>
            <div className="text-slate-400 text-xs">{user?.email}</div>
          </div>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }} onClick={onLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {/* Header */}
        <header className="flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 sticky top-0 z-30">
          <div className="relative w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search patients, ID..." className="input pl-10 bg-slate-50 border-none" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-sm font-semibold text-slate-600">Online & Available</span>
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="avatar bg-blue-100 text-blue-600">{user?.name?.charAt(0) || 'D'}</div>
              <div>
                <div className="font-bold text-sm text-slate-800">{user?.name || 'Doctor'}</div>
                <div className="text-xs text-slate-500">Doctor</div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Today's Overview</h1>
                <div className="text-slate-500 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="stat-card border-t-4 border-t-blue-500">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Total Appointments</div>
                  <div className="text-3xl font-black text-slate-800">{stats.total}</div>
                </div>
                <div className="stat-card border-t-4 border-t-orange-500">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Upcoming</div>
                  <div className="text-3xl font-black text-orange-600">{stats.upcoming}</div>
                </div>
                <div className="stat-card border-t-4 border-t-green-500">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Completed</div>
                  <div className="text-3xl font-black text-green-600">{stats.completed}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold">Upcoming Appointments</h2>
                  <button className="btn btn-outline btn-sm" onClick={fetchAppointments}><RefreshCw size={14}/> Refresh</button>
                </div>
                <div className="table-wrapper border-none">
                  <table>
                    <thead>
                      <tr><th>Patient</th><th>Date</th><th>Time</th><th>Type</th><th>Ref</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {loadingApts && <tr><td colSpan="7" style={{textAlign:'center',padding:20}}>Loading...</td></tr>}
                      {!loadingApts && appointments.slice(0,5).map((apt, i) => (
                        <tr key={i}>
                          <td className="font-bold">{apt.patient_name || 'Patient'}</td>
                          <td>{apt.date}</td>
                          <td>{apt.time}</td>
                          <td><span className="badge badge-gray">{apt.type}</span></td>
                          <td className="font-mono text-xs">{apt.ref_code}</td>
                          <td><span className={`badge ${apt.status==='Upcoming'?'badge-blue':apt.status==='Completed'?'badge-green':'badge-gray'}`}>{apt.status}</span></td>
                          <td>
                            {apt.status === 'Upcoming' && (
                              <button className="btn btn-success btn-sm" onClick={() => updateStatus(apt.id, 'Completed')}>
                                <CheckCircle size={14}/> Done
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!loadingApts && appointments.length === 0 && (
                        <tr><td colSpan="7" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No appointments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">All Appointments</h1>
                <button className="btn btn-outline" onClick={fetchAppointments}><RefreshCw size={14}/> Refresh</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Patient</th><th>Date</th><th>Time</th><th>Type</th><th>Notes</th><th>Ref Code</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {loadingApts && <tr><td colSpan="8" style={{textAlign:'center',padding:20}}>Loading...</td></tr>}
                    {appointments.map((apt, i) => (
                      <tr key={i}>
                        <td className="font-bold">{apt.patient_name || 'Patient'}</td>
                        <td>{apt.date}</td>
                        <td>{apt.time}</td>
                        <td>{apt.type}</td>
                        <td style={{maxWidth:150,fontSize:'0.8rem',color:'#64748B'}}>{apt.notes || '—'}</td>
                        <td className="font-mono text-xs text-blue-600">{apt.ref_code}</td>
                        <td><span className={`badge ${apt.status==='Upcoming'?'badge-blue':apt.status==='Completed'?'badge-green':'badge-gray'}`}>{apt.status}</span></td>
                        <td>
                          {apt.status === 'Upcoming' && (
                            <div style={{display:'flex',gap:6}}>
                              <button className="btn btn-success btn-sm" onClick={() => updateStatus(apt.id, 'Completed')}><CheckCircle size={14}/></button>
                              <button className="btn btn-danger btn-sm" onClick={() => updateStatus(apt.id, 'Cancelled')}><XCircle size={14}/></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!loadingApts && appointments.length === 0 && (
                      <tr><td colSpan="8" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No appointments yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PATIENTS */}
          {activeTab === 'patients' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">My Patients</h1>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden font-sans">
                <div className="table-wrapper border-none">
                  <table>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Last Appointment</th>
                        <th>Type</th>
                        <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...new Map(appointments.filter(a => a.patient_id).map(a => [a.patient_id, a])).values()].map((apt, i) => (
                        <tr key={i}>
                          <td className="font-bold flex items-center gap-2">
                            <div style={{width:32,height:32,borderRadius:'50%',background:'#EFF6FF',color:'#2563EB',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>
                              {apt.patient_name?.charAt(0) || '?'}
                            </div>
                            {apt.patient_name || 'Unknown'}
                          </td>
                          <td>{apt.date}</td>
                          <td>{apt.type}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingRight: '12px' }}>
                              <button 
                                className="btn btn-primary btn-sm flex items-center gap-1"
                                onClick={() => {
                                  setNewPres({
                                    patient_id: apt.patient_id,
                                    diagnosis: '',
                                    medications: [],
                                    advice: ''
                                  });
                                  setShowPresModal(true);
                                }}
                              >
                                <Pill size={14} /> Issue Rx
                              </button>
                              <button 
                                className="btn btn-outline btn-sm flex items-center gap-1"
                                onClick={() => {
                                  setSelectedPatientForReports({ id: apt.patient_id, name: apt.patient_name });
                                  fetchPatientReports(apt.patient_id);
                                }}
                              >
                                <FileText size={14} /> Reports
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {appointments.filter(a => a.patient_id).length === 0 && (
                        <tr><td colSpan="4" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No patients yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">Earnings Overview</h1>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="stat-card border-t-4 border-t-green-500">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Completed Sessions</div>
                  <div className="text-3xl font-black text-green-600">{stats.completed}</div>
                </div>
                <div className="stat-card border-t-4 border-t-blue-500">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Total Appointments</div>
                  <div className="text-3xl font-black text-blue-600">{stats.total}</div>
                </div>
                <div className="stat-card border-t-4 border-t-purple-500">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Est. Earnings</div>
                  <div className="text-3xl font-black text-purple-600">৳{(stats.completed * 800).toLocaleString()}</div>
                </div>
              </div>
              <div className="card p-6">
                <p style={{color:'#64748B'}}>Detailed earnings breakdown and payouts will be available after connecting to payment gateway integration.</p>
              </div>
            </div>
          )}

          {/* PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Prescriptions</h1>
                <button className="btn btn-primary" onClick={() => setShowPresModal(true)}>+ Issue New Prescription</button>
              </div>

              {loadingPres ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#64748B' }}>Loading prescriptions...</div>
              ) : prescriptions.length === 0 ? (
                <div className="card p-8 text-center bg-white border border-slate-200">
                  <Pill size={48} style={{ color: '#CBD5E1', margin: '0 auto 16px' }} />
                  <p style={{ color: '#64748B', fontSize: '1.1rem' }}>No prescriptions issued yet.</p>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: 8 }}>Click the button above to issue a digital prescription for your patients.</p>
                </div>
              ) : (
                <div className="table-wrapper bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <table>
                    <thead>
                      <tr>
                        <th>Rx ID</th>
                        <th>Patient Name</th>
                        <th>Diagnosis</th>
                        <th>Medications</th>
                        <th>Issued Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((rx) => {
                        let meds = [];
                        try {
                          meds = JSON.parse(rx.medications);
                        } catch (e) {
                          meds = [];
                        }
                        return (
                          <tr key={rx.id}>
                            <td className="font-mono text-xs font-semibold text-blue-600">RX-{rx.id}</td>
                            <td className="font-bold text-slate-800">{rx.patient_name || 'Patient'}</td>
                            <td className="text-slate-600 text-sm font-medium">{rx.diagnosis}</td>
                            <td className="text-xs text-slate-500">
                              {meds.map((m, idx) => (
                                <div key={idx}>• {m.name} ({m.dosage})</div>
                              ))}
                            </td>
                            <td className="text-slate-500 text-sm">{new Date(rx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td>
                              <button className="btn btn-outline btn-sm flex items-center gap-1.5" onClick={() => printPrescription(rx)}>
                                <Download size={14} /> Print / PDF
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

                          </div>
          )}
{/* Create Prescription Modal */}
              {showPresModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                  <div className="card p-6 animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', borderRadius: 16, border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>Issue New Prescription</h3>
                    
                    <form onSubmit={handleCreatePrescription} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Select Patient</label>
                        <select 
                          className="input" 
                          value={newPres.patient_id} 
                          onChange={e => setNewPres(p => ({ ...p, patient_id: e.target.value }))}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                        >
                          <option value="">-- Select Patient --</option>
                          {[...new Map(appointments.map(a => [a.patient_id, { id: a.patient_id, name: a.patient_name }])).values()].filter(p => p.id).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Diagnosis</label>
                        <input 
                          type="text"
                          className="input" 
                          placeholder="e.g. Hypertension, Acute Fever" 
                          value={newPres.diagnosis} 
                          onChange={e => setNewPres(p => ({ ...p, diagnosis: e.target.value }))} 
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} 
                        />
                      </div>

                      {/* Add Medication Section */}
                      <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>Add Medication</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <input 
                            type="text" 
                            placeholder="Medicine Name (e.g. Napa Extend 665mg)" 
                            value={medInput.name} 
                            onChange={e => setMedInput(m => ({ ...m, name: e.target.value }))}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                          />
                          <input 
                            type="text" 
                            placeholder="Dosage (e.g. 1+0+1)" 
                            value={medInput.dosage} 
                            onChange={e => setMedInput(m => ({ ...m, dosage: e.target.value }))}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                          <select 
                            value={medInput.instruction} 
                            onChange={e => setMedInput(m => ({ ...m, instruction: e.target.value }))}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                          >
                            <option value="After Food">After Food</option>
                            <option value="Before Food">Before Food</option>
                            <option value="Empty Stomach">Empty Stomach</option>
                            <option value="At Bedtime">At Bedtime</option>
                          </select>
                          <input 
                            type="text" 
                            placeholder="Duration (e.g. 7 Days)" 
                            value={medInput.duration} 
                            onChange={e => setMedInput(m => ({ ...m, duration: e.target.value }))}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                          />
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-outline btn-sm" 
                          style={{ width: '100%', fontWeight: 600 }}
                          onClick={handleAddMedication}
                        >
                          + Add to Prescription
                        </button>

                        {/* Medications Added List */}
                        {newPres.medications.length > 0 && (
                          <div style={{ marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '8px' }}>Added Medicines:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {newPres.medications.map((m, idx) => (
                                <div key={idx} style={{ display: 'flex', justify: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                  <div>
                                    <strong>{m.name}</strong> - {m.dosage} ({m.instruction}, {m.duration})
                                  </div>
                                  <button 
                                    type="button" 
                                    style={{ color: '#EF4444', fontWeight: 'bold', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                    onClick={() => handleRemoveMedication(idx)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Special Advice / Instructions</label>
                        <textarea 
                          className="input" 
                          placeholder="e.g. Avoid cold drinks, take absolute bed rest..." 
                          value={newPres.advice} 
                          onChange={e => setNewPres(p => ({ ...p, advice: e.target.value }))} 
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', minHeight: 60 }} 
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Suggested Tests (Optional)</label>
                        <input 
                          type="text"
                          className="input" 
                          placeholder="e.g. Complete Blood Count (CBC), Chest X-Ray" 
                          value={newPres.suggested_tests} 
                          onChange={e => setNewPres(p => ({ ...p, suggested_tests: e.target.value }))} 
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} 
                        />
                      </div>

                      {prescriptionError && (
                        <div style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 600 }}>
                          {prescriptionError}
                        </div>
                      )}

                      {prescriptionSuccess && (
                        <div style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 600 }}>
                          {prescriptionSuccess}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-ghost" onClick={() => { setShowPresModal(false); setPrescriptionError(''); }}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Issue & Sign</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Manage Reports Modal */}
              {selectedPatientForReports && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                  <div className="card p-6 animate-fade-in" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', borderRadius: 16, border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
                        Medical Reports: {selectedPatientForReports.name}
                      </h3>
                      <button 
                        className="btn btn-ghost btn-sm text-slate-500 font-bold" 
                        onClick={() => { setSelectedPatientForReports(null); setReportSuccess(''); setReportError(''); }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Upload Report Form */}
                    <form onSubmit={handleAddReport} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileUp size={16} className="text-blue-600" /> Upload New Report / Test Result
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Report Title (e.g. Blood Test, Chest X-Ray)" 
                          value={newReportForm.title} 
                          onChange={e => setNewReportForm(f => ({ ...f, title: e.target.value }))}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                        />
                        <select 
                          value={newReportForm.type} 
                          onChange={e => setNewReportForm(f => ({ ...f, type: e.target.value }))}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                        >
                          <option value="Lab Result">Lab Result</option>
                          <option value="Radiology">Radiology</option>
                          <option value="Immunization">Immunization</option>
                          <option value="Diagnostic Report">Diagnostic Report</option>
                          <option value="Prescription Check">Prescription Check</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => setNewReportForm(f => ({ ...f, file: e.target.files[0] }))}
                          style={{ fontSize: '0.85rem' }}
                        />
                        <button type="submit" className="btn btn-primary btn-sm ml-auto">
                          Upload Report
                        </button>
                      </div>
                      {reportError && (
                        <div style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>{reportError}</div>
                      )}
                      {reportSuccess && (
                        <div style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600 }}>{reportSuccess}</div>
                      )}
                    </form>

                    {/* Existing Reports List */}
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                        Uploaded Medical Reports & Records
                      </h4>
                      {loadingPatientReports ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>Loading patient records...</div>
                      ) : patientReports.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', border: '2px dashed #E2E8F0', borderRadius: '8px' }}>
                          No reports available for this patient.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                          {patientReports.map((report) => (
                            <div key={report.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                              <div>
                                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.9rem' }}>{report.title}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                  <span className="badge badge-gray text-xs">{report.type}</span>
                                  <span>Uploaded: {report.date}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {report.file_url && (
                                  <a 
                                    href={`http://localhost:5000${report.file_url}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="btn btn-outline btn-sm flex items-center gap-1"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  >
                                    <Eye size={12} /> View File
                                  </a>
                                )}
                                <button 
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '4px 8px', background: '#FEF2F2', borderColor: '#FEE2E2', color: '#EF4444' }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
        </div>
      </main>
    </div>
  );
}
