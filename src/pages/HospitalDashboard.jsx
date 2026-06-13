import React, { useState, useEffect } from 'react';
import {
  Heart, Building, Users, Calendar, Ambulance, LogOut,
  Search, Bell, TrendingUp, Activity, RefreshCw,
  CheckCircle, AlertTriangle, XCircle, Phone, MapPin,
  FileText, Trash2, Eye, FileUp, MessageSquare, Droplet
} from 'lucide-react';
import API from '../api';

export default function HospitalDashboard({ user, onLogout, navigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppts] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicalTests, setMedicalTests] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedPatientForReports, setSelectedPatientForReports] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [loadingPatientReports, setLoadingPatientReports] = useState(false);
  const [newReportForm, setNewReportForm] = useState({ title: '', type: 'Lab Result', file: null });
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportError, setReportError] = useState('');

  const token = () => localStorage.getItem('token');

  const fetchPatientReports = async (patientId) => {
    try {
      setLoadingPatientReports(true);
      const res = await API.get(`/api/records?patient_id=${patientId}`, {
        headers: { Authorization: `Bearer ${token()}` }
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
      const formData = new FormData();
      formData.append('title', newReportForm.title);
      formData.append('type', newReportForm.type);
      formData.append('file', newReportForm.file);
      formData.append('patient_id', selectedPatientForReports.id);

      await API.post('/api/records', formData, {
        headers: {
          Authorization: `Bearer ${token()}`,
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
      await API.delete(`/api/records/${reportId}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      fetchPatientReports(selectedPatientForReports.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete report.');
    }
  };

  const navItems = [
    { id: 'overview',     label: 'Overview',       icon: Building },
    { id: 'appointments', label: 'Appointments',   icon: Calendar },
    { id: 'patients',     label: 'Patients & Reports', icon: FileText },
    { id: 'tests',        label: 'Medical Tests',  icon: Activity },
    { id: 'doctors',      label: 'Our Doctors',    icon: Users },
    { id: 'ambulance',    label: 'Ambulance',      icon: Ambulance },
    { id: 'emergencies',  label: 'Emergency SOS',  icon: AlertTriangle },
  ];

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [aptsRes, emsRes, docsRes, testsRes] = await Promise.allSettled([
        API.get('/api/appointments/all', { headers }),
        API.get('/api/emergencies'),
        API.get('/api/doctors'),
        API.get('/api/tests/hospital', { headers }),
      ]);
      setAppts(aptsRes.status === 'fulfilled' ? (aptsRes.value.data || []) : []);
      setEmergencies(emsRes.status === 'fulfilled' ? (emsRes.value.data || []) : []);
      setDoctors(docsRes.status === 'fulfilled' ? (docsRes.value.data || []) : []);
      setMedicalTests(testsRes.status === 'fulfilled' ? (testsRes.value.data || []) : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateTestStatus = async (id, status) => {
    try {
      await API.put(`/api/tests/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token()}` } });
      fetchAll();
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  const updateEmsStatus = async (id, status) => {
    try {
      await API.put(`/api/emergencies/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token()}` } });
      fetchAll();
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  const updateAptStatus = async (id, status) => {
    try {
      await API.put(`/api/appointments/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token()}` } });
      fetchAll();
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  const activeEmergencies = emergencies.filter(e => e.status === 'Active');
  const upcomingApts = appointments.filter(a => a.status === 'Upcoming');

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
              <button key={item.id}
                onClick={() => { setActiveTab(item.id); fetchAll(); }}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: activeTab === item.id ? 'rgba(37,99,235,0.1)' : 'transparent', textAlign: 'left', position: 'relative' }}
              >
                <item.icon size={20} />
                {item.label}
                {item.id === 'emergencies' && activeEmergencies.length > 0 && (
                  <span style={{ position: 'absolute', right: 12, background: '#EF4444', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {activeEmergencies.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-800 pt-4">
          <div className="px-4 py-2">
            <div className="text-white font-bold text-sm">{user?.name || 'Hospital'}</div>
            <div className="text-slate-400 text-xs">{user?.email}</div>
          </div>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }} onClick={() => navigate('forum')}>
            <MessageSquare size={20} color="#BEF264" /> Community Forum
          </button>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }} onClick={() => navigate('blood-donors')}>
            <Droplet size={20} color="#EF4444" fill="#EF4444" /> Blood Donors
          </button>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }} onClick={onLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 sticky top-0 z-30">
          <div className="relative w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search staff, patients..." className="input pl-10 bg-slate-50 border-none" />
          </div>
          <div className="flex items-center gap-6">
            <button className="btn btn-outline btn-sm" onClick={fetchAll}><RefreshCw size={14}/> Refresh</button>
            {activeEmergencies.length > 0 && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 700, color: '#DC2626' }}>
                <AlertTriangle size={16}/> {activeEmergencies.length} Active SOS!
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="avatar bg-purple-100 text-purple-600">H</div>
              <div>
                <div className="font-bold text-sm text-slate-800">{user?.name || 'Hospital Admin'}</div>
                <div className="text-xs text-slate-500">Hospital Dashboard</div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">Hospital Dashboard</h1>
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="stat-card border-t-4 border-t-blue-500">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Registered Doctors</div>
                  <div className="text-3xl font-black text-slate-800">{doctors.length}</div>
                  <div className="text-sm text-green-500 font-medium mt-2 flex items-center gap-1"><TrendingUp size={14}/> Available on platform</div>
                </div>
                <div className="stat-card border-t-4 border-t-green-500">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Total Appointments</div>
                  <div className="text-3xl font-black text-slate-800">{appointments.length}</div>
                  <div className="text-sm text-slate-400 font-medium mt-2">{upcomingApts.length} upcoming</div>
                </div>
                <div className="stat-card border-t-4 border-t-purple-500">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Completed</div>
                  <div className="text-3xl font-black text-slate-800">{appointments.filter(a=>a.status==='Completed').length}</div>
                </div>
                <div className="stat-card border-t-4 border-t-red-500">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Active SOS</div>
                  <div className="text-3xl font-black text-red-600">{activeEmergencies.length}</div>
                  {activeEmergencies.length > 0 && (
                    <div className="text-sm text-red-500 font-medium mt-2 flex items-center gap-1"><AlertTriangle size={14}/> Requires action!</div>
                  )}
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold">Recent Appointments</h2>
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('appointments')}>View All</button>
                </div>
                <div className="table-wrapper border-none">
                  <table>
                    <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Type</th><th>Status</th></tr></thead>
                    <tbody>
                      {loading && <tr><td colSpan="5" style={{textAlign:'center',padding:20}}>Loading...</td></tr>}
                      {appointments.slice(0,5).map((a, i) => (
                        <tr key={i}>
                          <td className="font-bold">{a.patient_name || '—'}</td>
                          <td>{a.doctor_name || '—'}</td>
                          <td>{a.date}</td>
                          <td><span className="badge badge-gray text-xs">{a.type}</span></td>
                          <td><span className={`badge ${a.status==='Upcoming'?'badge-blue':a.status==='Completed'?'badge-green':'badge-gray'}`}>{a.status}</span></td>
                        </tr>
                      ))}
                      {!loading && appointments.length === 0 && <tr><td colSpan="5" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No appointments.</td></tr>}
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
                <button className="btn btn-outline" onClick={fetchAll}><RefreshCw size={14}/> Refresh</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Ref</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {appointments.map((a, i) => (
                      <tr key={i}>
                        <td className="font-mono text-xs text-blue-600">{a.ref_code}</td>
                        <td className="font-bold">{a.patient_name || '—'}</td>
                        <td>{a.doctor_name || '—'}</td>
                        <td>{a.date}</td>
                        <td>{a.time}</td>
                        <td>{a.type}</td>
                        <td><span className={`badge ${a.status==='Upcoming'?'badge-blue':a.status==='Completed'?'badge-green':'badge-gray'}`}>{a.status}</span></td>
                        <td>
                          {a.status === 'Upcoming' && (
                            <div style={{display:'flex',gap:4}}>
                              <button className="btn btn-success btn-sm" onClick={() => updateAptStatus(a.id,'Completed')}><CheckCircle size={13}/></button>
                              <button className="btn btn-danger btn-sm" onClick={() => updateAptStatus(a.id,'Cancelled')}><XCircle size={13}/></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {appointments.length===0 && <tr><td colSpan="8" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No appointments.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DOCTORS */}
          {activeTab === 'doctors' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Our Doctors</h1>
                <span className="badge badge-green">{doctors.length} on Platform</span>
              </div>
              <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:20,display:'grid'}}>
                {doctors.map((d, i) => (
                  <div key={i} className="card" style={{padding:24}}>
                    <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16}}>
                      {d.image ? (
                        <img src={d.image} alt={d.name} style={{width:48,height:48,borderRadius:'50%',objectFit:'cover',boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}} />
                      ) : (
                        <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#2563EB,#7C3AED)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'1.1rem'}}>
                          {d.image_initials || d.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div style={{fontWeight:800,fontSize:'1rem',color:'#0F172A'}}>{d.name}</div>
                        <div style={{color:'#64748B',fontSize:'0.85rem'}}>{d.specialty}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8,fontSize:'0.85rem',color:'#64748B'}}>
                      <div><Building size={14} style={{display:'inline',marginRight:6}}/>{d.hospital}</div>
                      {d.phone && <div><Phone size={14} style={{display:'inline',marginRight:6}}/>{d.phone}</div>}
                      <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                        <span style={{fontWeight:700,color:'#10B981'}}>Fee: {d.fee}</span>
                        <span>⭐ {d.rating}</span>
                        <span className={`badge ${d.available?'badge-green':'badge-gray'}`}>{d.available?'Available':'Unavailable'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {doctors.length === 0 && <p style={{color:'#94A3B8',padding:20}}>No doctors found.</p>}
              </div>
            </div>
          )}

          {/* AMBULANCE */}
          {activeTab === 'ambulance' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">Ambulance Management</h1>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  {label:'Total Fleet',val:'5',color:'text-blue-600',border:'border-t-blue-500'},
                  {label:'Currently Active',val:'3',color:'text-green-600',border:'border-t-green-500'},
                  {label:'On SOS Call',val: activeEmergencies.length.toString(),color:'text-red-600',border:'border-t-red-500'},
                ].map((s,i) => (
                  <div key={i} className={`stat-card border-t-4 ${s.border}`}>
                    <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">{s.label}</div>
                    <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="card p-6">
                <p style={{color:'#64748B'}}>Real-time ambulance GPS tracking integration coming soon. Emergency SOS alerts appear in the Emergency tab.</p>
              </div>
            </div>
          )}

          {/* EMERGENCIES */}
          {activeTab === 'emergencies' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-red-600">Active SOS Emergencies</h1>
                <button className="btn btn-outline" onClick={fetchAll}><RefreshCw size={14}/> Refresh</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Time</th><th>Patient Name</th><th>Phone</th><th>Location / GPS</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {emergencies.map((em, i) => (
                      <tr key={i} style={{ background: em.status === 'Active' ? '#FEF2F2' : 'white' }}>
                        <td className="text-sm text-slate-500">{new Date(em.created_at).toLocaleString()}</td>
                        <td className="font-bold">{em.patient_name || 'Anonymous User'}</td>
                        <td>{em.patient_phone || '—'}</td>
                        <td>
                          <div className="font-bold">{em.location}</div>
                          <div className="text-xs text-slate-500 font-mono">{em.coordinates}</div>
                        </td>
                        <td><span className={`badge ${em.status==='Active'?'badge-red':em.status==='Dispatched'?'badge-blue':'badge-green'}`}>{em.status}</span></td>
                        <td>
                          {em.status === 'Active' && (
                            <button className="btn btn-primary btn-sm" style={{background:'#2563EB',borderColor:'#2563EB'}} onClick={() => updateEmsStatus(em.id,'Dispatched')}>
                              <Ambulance size={14}/> Dispatch
                            </button>
                          )}
                          {em.status === 'Dispatched' && (
                            <button className="btn btn-primary btn-sm" style={{background:'#10B981',borderColor:'#10B981'}} onClick={() => updateEmsStatus(em.id,'Resolved')}>
                              <CheckCircle size={14}/> Resolved
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {emergencies.length === 0 && <tr><td colSpan="6" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No emergencies right now.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* PATIENTS & REPORTS */}
          {/* MEDICAL TESTS */}
          {activeTab === 'tests' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Medical Tests (Pending & Completed)</h1>
                <span className="badge badge-blue">{medicalTests.length} Total</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Date</th><th>Patient</th><th>Phone</th><th>Test Name</th><th>Fee Collected</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {medicalTests.map((t, i) => (
                      <tr key={i}>
                        <td className="text-sm text-slate-500">{new Date(t.created_at).toLocaleDateString()}</td>
                        <td className="font-bold">{t.patient_name}</td>
                        <td>{t.patient_phone || '—'}</td>
                        <td className="font-semibold text-blue-600">{t.test_name}</td>
                        <td className="font-bold text-green-600">৳{t.total_fee}</td>
                        <td><span className={`badge ${t.status === 'Completed' ? 'badge-green' : t.status === 'Pending' ? 'badge-blue' : 'badge-gray'}`}>{t.status}</span></td>
                        <td>
                          {t.status === 'Pending' && (
                            <button 
                              className="btn btn-success btn-sm" 
                              onClick={() => {
                                updateTestStatus(t.id, 'Completed');
                                // Switch to Patients tab to upload report
                                setSelectedPatientForReports({ id: t.patient_id, name: t.patient_name });
                                setActiveTab('patients');
                              }}
                            >
                              Mark Completed & Upload Report
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {medicalTests.length === 0 && <tr><td colSpan="7" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No medical tests assigned.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Patients & Medical Reports</h1>
                <button className="btn btn-outline" onClick={fetchAll}><RefreshCw size={14}/> Refresh</button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden font-sans">
                <div className="table-wrapper border-none">
                  <table>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Email / Contact</th>
                        <th>Associated Doctor</th>
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
                          <td className="text-sm text-slate-500">
                            {apt.patient_phone || 'No phone number'}
                          </td>
                          <td>
                            {apt.doctor_name || '—'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingRight: '12px' }}>
                              <button 
                                className="btn btn-primary btn-sm flex items-center gap-1"
                                onClick={() => {
                                  setSelectedPatientForReports({ id: apt.patient_id, name: apt.patient_name });
                                  fetchPatientReports(apt.patient_id);
                                }}
                              >
                                <FileText size={14} /> Provide/Manage Reports
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {appointments.filter(a => a.patient_id).length === 0 && (
                        <tr><td colSpan="4" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No patients registered or seen in appointments yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Manage Reports Modal */}
      {selectedPatientForReports && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card p-6 animate-fade-in" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', borderRadius: 16, border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
                Medical Test Reports: {selectedPatientForReports.name}
              </h3>
              <button 
                className="btn btn-ghost btn-sm text-slate-500 font-bold" 
                onClick={() => { setSelectedPatientForReports(null); setReportSuccess(''); setReportError(''); }}
              >
                ✕
              </button>
            </div>

            {/* Upload Report Form (Hospital Admin) */}
            <form onSubmit={handleAddReport} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileUp size={16} className="text-blue-600" /> Provide New Medical Test Report (Diagnostic, Blood test, etc.)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Report / Test Title (e.g. CBC Blood Report, ECG)" 
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
                  Provide Report
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
                All Provided Records
              </h4>
              {loadingPatientReports ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>Loading patient reports...</div>
              ) : patientReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', border: '2px dashed #E2E8F0', borderRadius: '8px' }}>
                  No reports provided yet for this patient.
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
  );
}
