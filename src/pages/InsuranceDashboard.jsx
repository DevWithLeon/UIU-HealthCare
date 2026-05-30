import React, { useState, useEffect } from 'react';
import {
  Heart, Shield, Users, Activity, FileText, CheckCircle,
  XCircle, LogOut, Search, Bell, DollarSign, RefreshCw, AlertCircle, Eye
} from 'lucide-react';
import API from '../api';

export default function InsuranceDashboard({ user, onLogout, navigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, paid: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);

  const token = () => localStorage.getItem('token');

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Activity },
    { id: 'claims',   label: 'Insurance Claims',   icon: FileText },
    { id: 'patients', label: 'Patient Registry',   icon: Users },
  ];

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/insurance/all', {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = res.data || [];
      setClaims(data);

      // Compute stats
      const total = data.length;
      const pending = data.filter(c => c.status === 'Pending').length;
      const approved = data.filter(c => c.status === 'Approved').length;
      const rejected = data.filter(c => c.status === 'Rejected').length;
      const paid = data
        .filter(c => c.status === 'Approved')
        .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

      setStats({ total, pending, approved, rejected, paid });
    } catch (err) {
      console.error('Failed to fetch insurance claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/api/insurance/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      fetchClaims();
      if (selectedClaim && selectedClaim.id === id) {
        setSelectedClaim(prev => ({ ...prev, status }));
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredClaims = claims.filter(c => 
    c.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar flex flex-col justify-between" style={{ padding: '24px 16px', background: '#0F172A' }}>
        <div>
          <div className="flex items-center gap-3 mb-12 px-4 cursor-pointer" onClick={() => navigate('home')}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>Insurance Portal</span>
          </div>

          <div className="flex flex-col gap-2">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); fetchClaims(); }}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                style={{ 
                  width: '100%', 
                  border: 'none', 
                  background: activeTab === item.id ? 'rgba(245,158,11,0.1)' : 'transparent',
                  color: activeTab === item.id ? '#F59E0B' : '#94A3B8',
                  textAlign: 'left' 
                }}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-800 pt-4 mt-4">
          <div className="px-4 py-2">
            <div className="text-white font-bold text-sm">{user?.name || 'Insurance Admin'}</div>
            <div className="text-slate-400 text-xs">{user?.email}</div>
          </div>
          <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', color: '#94A3B8' }} onClick={onLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main bg-slate-50">
        <header className="flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 sticky top-0 z-30">
          <div className="relative w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search claims or patient name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input pl-10 bg-slate-50 border-none" 
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="btn btn-outline btn-sm" onClick={fetchClaims}><RefreshCw size={14}/> Refresh</button>
            <span className="badge font-bold flex items-center gap-1" style={{ background: '#FEF3C7', color: '#D97706' }}><Shield size={12}/> Claims Officer</span>
            <div className="flex items-center gap-3">
              <div className="avatar bg-amber-100 text-amber-600 font-bold">{user?.name?.charAt(0) || 'I'}</div>
              <div className="font-bold text-sm text-slate-800">{user?.name || 'GreenLife Insurance'}</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">Insurance Platform Metrics</h1>
              
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="stat-card border-t-4 border-t-amber-500">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Claims</div>
                  <div className="text-3xl font-black text-slate-800">{stats.total}</div>
                </div>
                <div className="stat-card border-t-4 border-t-blue-500">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Claims</div>
                  <div className="text-3xl font-black text-blue-600">{stats.pending}</div>
                </div>
                <div className="stat-card border-t-4 border-t-green-500">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Approved Claims</div>
                  <div className="text-3xl font-black text-green-600">{stats.approved}</div>
                </div>
                <div className="stat-card border-t-4 border-t-purple-500">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Disbursements</div>
                  <div className="text-3xl font-black text-purple-600">৳{stats.paid.toLocaleString()}</div>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle size={20} className="text-amber-500"/> Action Required
                  </h2>
                  <span className="badge badge-blue">{stats.pending} Pending Claims</span>
                </div>
                <div className="table-wrapper border-none">
                  <table>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Claim Details</th>
                        <th>Attached Bill</th>
                        <th>Claimed Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>Loading...</td></tr>}
                      {!loading && claims.filter(c => c.status === 'Pending').slice(0, 5).map((claim, i) => (
                        <tr key={i}>
                          <td className="font-bold text-slate-800">{claim.patient_name}</td>
                          <td>
                            <div className="font-semibold">{claim.title}</div>
                            <div className="text-xs text-slate-500">{claim.description || 'No description'}</div>
                          </td>
                          <td>
                            {claim.file_url ? (
                              <a 
                                href={`http://localhost:5000${claim.file_url}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2563EB', fontWeight: 600, fontSize: '0.85rem' }}
                              >
                                <Eye size={14}/> View Document
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">No Document</span>
                            )}
                          </td>
                          <td className="font-bold text-slate-900">৳{parseFloat(claim.amount).toLocaleString()}</td>
                          <td><span className="badge badge-blue">{claim.status}</span></td>
                          <td>
                            <div className="flex gap-2">
                              <button 
                                className="btn btn-success btn-sm flex items-center gap-1"
                                onClick={() => handleUpdateStatus(claim.id, 'Approved')}
                              >
                                <CheckCircle size={14}/> Approve
                              </button>
                              <button 
                                className="btn btn-outline btn-sm flex items-center gap-1"
                                style={{ borderColor: '#EF4444', color: '#EF4444' }}
                                onClick={() => handleUpdateStatus(claim.id, 'Rejected')}
                              >
                                <XCircle size={14}/> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!loading && claims.filter(c => c.status === 'Pending').length === 0 && (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>No pending claims needing review.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INSURANCE CLAIMS */}
          {activeTab === 'claims' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Insurance Claims</h1>
                <span className="badge badge-purple">{filteredClaims.length} Claims Total</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Claim Title</th>
                      <th>Attached Document</th>
                      <th>Claim Amount</th>
                      <th>Date Submitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((claim, i) => (
                      <tr key={i}>
                        <td className="font-bold text-slate-800">
                          <div>{claim.patient_name}</div>
                          <div className="text-xs text-slate-400 font-mono">{claim.patient_phone || 'No phone'}</div>
                        </td>
                        <td>
                          <div className="font-semibold">{claim.title}</div>
                          <div style={{ maxWidth: 220, fontSize: '0.8rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {claim.description || '—'}
                          </div>
                        </td>
                        <td>
                          {claim.file_url ? (
                            <a 
                              href={`http://localhost:5000${claim.file_url}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2563EB', fontWeight: 600, fontSize: '0.85rem' }}
                            >
                              <Eye size={14}/> View Document
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">No Attachment</span>
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
                        <td>
                          {claim.status === 'Pending' && (
                            <div className="flex gap-2">
                              <button 
                                className="btn btn-success btn-sm p-1.5"
                                onClick={() => handleUpdateStatus(claim.id, 'Approved')}
                              ><CheckCircle size={14}/></button>
                              <button 
                                className="btn btn-outline btn-sm p-1.5"
                                style={{ borderColor: '#EF4444', color: '#EF4444' }}
                                onClick={() => handleUpdateStatus(claim.id, 'Rejected')}
                              ><XCircle size={14}/></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredClaims.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>No claims match your search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PATIENTS REGISTRY */}
          {activeTab === 'patients' && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-6">Patient Registry</h1>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="table-wrapper border-none">
                  <table>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Contact Number</th>
                        <th>Claims Submitted</th>
                        <th>Disbursement Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...new Set(claims.map(c => c.patient_name))].map((pName, idx) => {
                        const pClaims = claims.filter(c => c.patient_name === pName);
                        const pPhone = pClaims[0]?.patient_phone || '—';
                        const pPaid = pClaims
                          .filter(c => c.status === 'Approved')
                          .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

                        return (
                          <tr key={idx}>
                            <td className="font-bold flex items-center gap-2">
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 800 }}>
                                {pName.charAt(0)}
                              </div>
                              {pName}
                            </td>
                            <td>{pPhone}</td>
                            <td>{pClaims.length} Claims</td>
                            <td className="font-bold text-green-600">৳{pPaid.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                      {claims.length === 0 && (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>No patients registered yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
