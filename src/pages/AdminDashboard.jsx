import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Activity, LogOut, Search, Bell,
  CheckCircle, XCircle, Building, FileText, RefreshCw,
  Calendar, AlertTriangle, Trash2, UserCheck, MessageSquare, Droplet, Database
} from 'lucide-react';
import API from '../api';

export default function AdminDashboard({ user, onLogout, navigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers]         = useState([]);
  const [appointments, setAppts]  = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [doctors, setDoctors]     = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats]         = useState({ users: 0, doctors: 0, appointments: 0, emergencies: 0 });
  const [loading, setLoading]     = useState(false);

  const token = () => localStorage.getItem('token');

  const navItems = [
    { id: 'overview',      label: 'Platform Overview', icon: Activity },
    { id: 'users',         label: 'User Management',   icon: Users },
    { id: 'appointments',  label: 'All Appointments',  icon: Calendar },
    { id: 'doctors',       label: 'Doctors',           icon: UserCheck },
    { id: 'emergencies',   label: 'Emergency SOS',     icon: AlertTriangle },
    { id: 'audit',         label: 'Audit Logs',        icon: FileText },
  ];

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [usersRes, aptsRes, emsRes, docsRes, auditRes] = await Promise.allSettled([
        API.get('/api/auth/users', { headers }),
        API.get('/api/appointments/all', { headers }),
        API.get('/api/emergencies'),
        API.get('/api/doctors'),
        API.get('/api/auth/audit-logs', { headers })
      ]);
      const u = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
      const a = aptsRes.status === 'fulfilled' ? aptsRes.value.data : [];
      const e = emsRes.status === 'fulfilled' ? emsRes.value.data : [];
      const d = docsRes.status === 'fulfilled' ? docsRes.value.data : [];
      const au = auditRes.status === 'fulfilled' ? auditRes.value.data : [];
      
      setUsers(Array.isArray(u) ? u : []);
      setAppts(Array.isArray(a) ? a : []);
      setEmergencies(Array.isArray(e) ? e : []);
      setDoctors(Array.isArray(d) ? d : []);
      setAuditLogs(Array.isArray(au) ? au : []);
      setStats({ users: u.length, doctors: d.length, appointments: a.length, emergencies: e.length });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleBan = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`)) return;
    try {
      await API.put(`/api/auth/users/${id}/ban`, { is_banned: currentStatus ? 0 : 1 }, { headers: { Authorization: `Bearer ${token()}` } });
      fetchAll();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/api/auth/users/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetUserPassword = async (id, name) => {
    const newPass = window.prompt(`Enter new password for ${name} (minimum 8 characters):`);
    if (newPass === null) return;
    if (newPass.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
    try {
      const res = await API.put(`/api/auth/users/${id}/reset-password`, { password: newPass }, { headers: { Authorization: `Bearer ${token()}` } });
      alert(res.data.message || 'Password updated successfully!');
      fetchAll();
    } catch (err) {
      alert('Password reset failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const updateAptStatus = async (id, status) => {
    try {
      await API.put(`/api/appointments/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token()}` } });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar flex flex-col justify-between" style={{ padding: '24px 16px', background: '#09090b' }}>
        <div>
          <div className="flex items-center gap-3 mb-12 px-4 cursor-pointer" onClick={() => navigate('home')}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>Admin Portal</span>
          </div>
          <div className="flex flex-col gap-2">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); fetchAll(); }}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: activeTab === item.id ? 'rgba(239,68,68,0.1)' : 'transparent', color: activeTab === item.id ? '#F87171' : '#94A3B8', textAlign: 'left' }}>
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-800 pt-4">
          <div className="px-4 py-2">
            <div className="text-white font-bold text-sm">{user?.name || 'Admin'}</div>
            <div className="text-slate-400 text-xs">{user?.email}</div>
          </div>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', color: '#94A3B8' }} onClick={() => navigate('forum')}>
            <MessageSquare size={20} color="#BEF264" /> Community Forum
          </button>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', color: '#94A3B8' }} onClick={() => navigate('blood-donors')}>
            <Droplet size={20} color="#EF4444" fill="#EF4444" /> Blood Donors
          </button>
          <a href="http://localhost:5000/api/auth/db-viewer" target="_blank" rel="noopener noreferrer" className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="#F59E0B" /> Database Explorer
          </a>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', color: '#94A3B8' }} onClick={onLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main bg-slate-50">
        <header className="flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 sticky top-0 z-30">
          <div className="relative w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Global search..." className="input pl-10 bg-slate-50 border-none" />
          </div>
          <div className="flex items-center gap-6">
            <button className="btn btn-outline btn-sm" onClick={fetchAll}><RefreshCw size={14}/> Refresh</button>
            <span className="badge badge-red font-bold flex items-center gap-1"><Shield size={12}/> Super Admin</span>
            <div className="flex items-center gap-3">
              <div className="avatar bg-red-100 text-red-600 font-black">{user?.name?.charAt(0) || 'A'}</div>
              <div className="font-bold text-sm text-slate-800">{user?.name || 'Admin'}</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">Platform Metrics</h1>
              <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Users', val: stats.users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-t-blue-500' },
                  { label: 'Doctors', val: stats.doctors, color: 'text-green-600', bg: 'bg-green-50', border: 'border-t-green-500' },
                  { label: 'Appointments', val: stats.appointments, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-t-purple-500' },
                  { label: 'SOS Alerts', val: stats.emergencies, color: 'text-red-600', bg: 'bg-red-50', border: 'border-t-red-500' },
                ].map((s, i) => (
                  <div key={i} className={`stat-card border-t-4 ${s.border}`}>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{s.label}</div>
                    <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold flex items-center gap-2"><AlertTriangle size={20} className="text-red-500"/> Active Emergencies</h2>
                  <span className="badge badge-red">{emergencies.filter(e => e.status === 'Active').length} Active</span>
                </div>
                <div className="table-wrapper border-none">
                  <table>
                    <thead><tr><th>Time</th><th>Patient</th><th>Location</th><th>Status</th></tr></thead>
                    <tbody>
                      {emergencies.slice(0,5).map((em, i) => (
                        <tr key={i} style={{ background: em.status === 'Active' ? '#FEF2F2' : 'white' }}>
                          <td className="text-sm text-slate-500">{new Date(em.created_at).toLocaleString()}</td>
                          <td className="font-bold">{em.patient_name || 'Anonymous'}</td>
                          <td>{em.location}</td>
                          <td><span className={`badge ${em.status==='Active'?'badge-red':em.status==='Dispatched'?'badge-blue':'badge-green'}`}>{em.status}</span></td>
                        </tr>
                      ))}
                      {emergencies.length === 0 && <tr><td colSpan="4" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No emergencies.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <span className="badge badge-blue">{users.length} Total Users</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Joined</th><th>Action</th></tr></thead>
                  <tbody>
                    {loading && <tr><td colSpan="7" style={{textAlign:'center',padding:20}}>Loading...</td></tr>}
                    {users.map((u, i) => (
                      <tr key={i}>
                        <td className="font-mono text-xs"># {u.id}</td>
                        <td className="font-bold">
                          {u.name}
                          {u.is_banned === 1 && <span className="badge badge-red ml-2 text-xs">Banned</span>}
                        </td>
                        <td className="text-slate-500 text-sm">{u.email}</td>
                        <td><span className={`badge ${u.role==='admin'?'badge-red':u.role==='doctor'?'badge-green':u.role==='hospital'?'badge-blue':'badge-gray'}`}>{u.role}</span></td>
                        <td className="text-slate-500">{u.phone || '—'}</td>
                        <td className="text-slate-500 text-sm">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                        <td>
                          {u.role !== 'admin' && (
                            <div style={{display:'flex', gap:'8px'}}>
                              <button 
                                className={`btn btn-sm ${u.is_banned ? 'btn-success' : 'btn-outline text-red-600'}`} 
                                onClick={() => toggleBan(u.id, u.is_banned)}
                                style={{ padding: '4px 8px' }}
                              >
                                {u.is_banned ? 'Unban' : 'Ban'}
                              </button>
                              <button 
                                className="btn btn-sm btn-outline text-amber-600"
                                onClick={() => resetUserPassword(u.id, u.name)}
                                style={{ padding: '4px 8px' }}
                              >
                                Reset Pass
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}><Trash2 size={14}/></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!loading && users.length === 0 && <tr><td colSpan="7" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No users found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">All Appointments</h1>
                <span className="badge badge-purple">{appointments.length} Total</span>
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
                        <td><span className="badge badge-gray text-xs">{a.type}</span></td>
                        <td><span className={`badge ${a.status==='Upcoming'?'badge-blue':a.status==='Completed'?'badge-green':'badge-gray'}`}>{a.status}</span></td>
                        <td>
                          {a.status === 'Upcoming' && (
                            <div style={{display:'flex',gap:4}}>
                              <button className="btn btn-success btn-sm" onClick={() => updateAptStatus(a.id, 'Completed')}><CheckCircle size={12}/></button>
                              <button className="btn btn-danger btn-sm" onClick={() => updateAptStatus(a.id, 'Cancelled')}><XCircle size={12}/></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && <tr><td colSpan="8" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No appointments.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DOCTORS */}
          {activeTab === 'doctors' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Registered Doctors</h1>
                <span className="badge badge-green">{doctors.length} Doctors</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Name</th><th>Specialty</th><th>Hospital</th><th>Fee</th><th>Rating</th><th>Available</th></tr></thead>
                  <tbody>
                    {doctors.map((d, i) => (
                      <tr key={i}>
                        <td className="font-bold">{d.name}</td>
                        <td>{d.specialty}</td>
                        <td>{d.hospital}</td>
                        <td className="font-bold text-green-600">{d.fee}</td>
                        <td>⭐ {d.rating}</td>
                        <td><span className={`badge ${d.available?'badge-green':'badge-gray'}`}>{d.available?'Yes':'No'}</span></td>
                      </tr>
                    ))}
                    {doctors.length === 0 && <tr><td colSpan="6" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No doctors found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EMERGENCIES */}
          {activeTab === 'emergencies' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-red-600">Emergency SOS Alerts</h1>
                <button className="btn btn-outline" onClick={fetchAll}><RefreshCw size={14}/> Refresh</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Time</th><th>Patient</th><th>Phone</th><th>Location</th><th>GPS</th><th>Status</th></tr></thead>
                  <tbody>
                    {emergencies.map((em, i) => (
                      <tr key={i} style={{ background: em.status === 'Active' ? '#FEF2F2' : 'white' }}>
                        <td className="text-sm text-slate-500">{new Date(em.created_at).toLocaleString()}</td>
                        <td className="font-bold">{em.patient_name || 'Anonymous'}</td>
                        <td>{em.patient_phone || '—'}</td>
                        <td>{em.location}</td>
                        <td className="font-mono text-xs">{em.coordinates}</td>
                        <td><span className={`badge ${em.status==='Active'?'badge-red':em.status==='Dispatched'?'badge-blue':'badge-green'}`}>{em.status}</span></td>
                      </tr>
                    ))}
                    {emergencies.length === 0 && <tr><td colSpan="6" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No emergencies.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AUDIT */}
          {activeTab === 'audit' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">System Audit Logs</h1>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Details</th></tr></thead>
                  <tbody>
                    {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                      <tr key={i}>
                        <td className="text-sm text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="font-bold">{log.admin_name}</td>
                        <td><span className="badge badge-gray">{log.action}</span></td>
                        <td className="text-sm text-slate-600">{log.details}</td>
                      </tr>
                    )) : <tr><td colSpan="4" style={{textAlign:'center',padding:20,color:'#94A3B8'}}>No audit logs found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
