import React, { useState, useEffect } from 'react';
import { 
  Droplet, Search, Filter, ArrowLeft, Phone, Plus, X, 
  CheckCircle, ShieldAlert, Edit, Trash2, MapPin, Copy, ExternalLink, RefreshCw
} from 'lucide-react';
import API from '../api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodDonorPage({ navigate, user }) {
  const [donors, setDonors] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [editingDonorId, setEditingDonorId] = useState(null);
  const [regForm, setRegForm] = useState({
    name: '',
    blood_group: 'A+',
    phone: '',
    district: '',
    location: ''
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Headers helper
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // Fetch donors and unique districts
  const fetchDonors = async () => {
    setLoading(true);
    try {
      const qParams = new URLSearchParams();
      if (selectedBloodGroup !== 'All') qParams.append('blood_group', selectedBloodGroup);
      if (selectedDistrict !== 'All') qParams.append('district', selectedDistrict);
      if (search) qParams.append('search', search);

      const res = await API.get(`/api/blood-donors?${qParams.toString()}`);
      setDonors(res.data);
    } catch (err) {
      console.error('Failed to fetch blood donors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await API.get('/api/blood-donors/districts');
      setDistricts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch districts:', err);
    }
  };

  // Check if logged-in user is already registered as donor
  const checkMyDonorStatus = async () => {
    if (!user) return;
    try {
      const res = await API.get('/api/blood-donors/me', getHeaders());
      if (res.data) {
        setIsRegistered(true);
        setRegForm({
          name: res.data.name,
          blood_group: res.data.blood_group,
          phone: res.data.phone,
          district: res.data.district,
          location: res.data.location
        });
      }
    } catch (err) {
      setIsRegistered(false);
      // Autofill registration form with user profile details
      setRegForm({
        name: user.name || '',
        blood_group: 'A+',
        phone: user.phone || '',
        district: '',
        location: ''
      });
    }
  };

  useEffect(() => {
    fetchDonors();
    fetchDistricts();
    checkMyDonorStatus();
  }, [selectedBloodGroup, selectedDistrict, search]);

  const handleRegisterOrUpdate = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);

    try {
      if (editingDonorId) {
        const res = await API.put(`/api/blood-donors/${editingDonorId}`, regForm, getHeaders());
        setRegSuccess(res.data.message || 'Successfully updated donor profile!');
      } else {
        const res = await API.post('/api/blood-donors', regForm, getHeaders());
        setRegSuccess(res.data.message || 'Successfully saved donor profile!');
      }
      setIsRegistered(true);
      fetchDonors();
      fetchDistricts();
      setTimeout(() => {
        setShowRegModal(false);
        setRegSuccess('');
        setEditingDonorId(null);
      }, 1500);
    } catch (err) {
      setRegError(err.response?.data?.error || 'Failed to save donor profile.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to remove your blood donor profile?')) return;
    setRegLoading(true);
    try {
      await API.delete('/api/blood-donors/me', getHeaders());
      setIsRegistered(false);
      setRegForm({
        name: user?.name || '',
        blood_group: 'A+',
        phone: user?.phone || '',
        district: '',
        location: ''
      });
      setRegSuccess('Donor profile removed successfully.');
      fetchDonors();
      fetchDistricts();
      setTimeout(() => {
        setShowRegModal(false);
        setRegSuccess('');
      }, 1500);
    } catch (err) {
      setRegError(err.response?.data?.error || 'Failed to delete donor profile.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleAdminDeleteDonor = async (donorId) => {
    if (!window.confirm('Are you sure you want to delete this donor profile?')) return;
    try {
      await API.delete(`/api/blood-donors/${donorId}`, getHeaders());
      alert('Donor profile deleted successfully.');
      fetchDonors();
      fetchDistricts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete donor profile.');
    }
  };

  const copyPhone = (phone, id) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ background: '#022C22', minHeight: '100vh', paddingBottom: 60, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      
      {/* CSS Styles */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .donor-card {
          transition: transform 0.2s, border-color 0.2s;
        }
        .donor-card:hover {
          transform: translateY(-4px);
          border-color: rgba(239, 68, 68, 0.3);
        }
        .input-glass {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          outline: none;
          width: 100%;
          transition: border-color 0.2s;
        }
        .input-glass:focus {
          border-color: #EF4444;
        }
        .blood-pill {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 10px 20px;
          border-radius: 30px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .blood-pill.active {
          background: #EF4444;
          border-color: #EF4444;
          color: white;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }
        .action-btn {
          background: #EF4444;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          alignItems: center;
          gap: 8px;
        }
        .action-btn:hover {
          background: #DC2626;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }
      `}</style>

      {/* Header Area */}
      <div style={{ background: 'radial-gradient(circle at 50% -20%, #B91C1C 0%, #7F1D1D 40%, #022C22 100%)', padding: '40px 32px 60px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button onClick={() => navigate(user ? `${user.role}-dashboard` : 'home')} 
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={24}/>
              </button>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Droplet size={36} fill="#EF4444" color="#EF4444" style={{ filter: 'drop-shadow(0 0 8px #EF4444)' }} /> Blood Donors Finder
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Find active blood donors or register to save lives.</p>
              </div>
            </div>
            
            {user ? (
              <button onClick={() => { setShowRegModal(true); setRegError(''); setRegSuccess(''); }} className="action-btn">
                {isRegistered ? <Edit size={18} /> : <Plus size={18} />}
                {isRegistered ? 'Update Donor Profile' : 'Register as Blood Donor'}
              </button>
            ) : (
              <button onClick={() => navigate('login')} className="action-btn">
                Log In to Register as Donor
              </button>
            )}
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 2, minWidth: 280 }}>
              <Search size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
              <input type="text" placeholder="Search by name, location, or phone number..." className="input-glass"
                style={{ paddingLeft: 52, paddingRight: 16, height: 56, fontSize: '1rem', width: '100%', borderRadius: 30 }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <select className="input-glass" style={{ height: 56, borderRadius: 30, paddingLeft: 20, fontSize: '1rem', cursor: 'pointer' }}
                value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
                <option value="All" style={{ background: '#022C22' }}>All Districts</option>
                {districts.map(d => (
                  <option key={d} value={d} style={{ background: '#022C22' }}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div style={{ maxWidth: 1280, margin: '-20px auto 0', padding: '0 32px' }}>
        
        {/* Blood Group pills */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 20, marginBottom: 32, scrollbarWidth: 'none' }}>
          <button onClick={() => setSelectedBloodGroup('All')} className={`blood-pill ${selectedBloodGroup === 'All' ? 'active' : ''}`}>
            All Groups
          </button>
          {BLOOD_GROUPS.map(bg => (
            <button key={bg} onClick={() => setSelectedBloodGroup(bg)} className={`blood-pill ${selectedBloodGroup === bg ? 'active' : ''}`}>
              {bg}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#EF4444' }}>
            <RefreshCw size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
            <p style={{ color: 'white', fontWeight: 600 }}>Searching database...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && donors.length === 0 && (
          <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
            <ShieldAlert size={64} style={{ color: '#EF4444', marginBottom: 20, opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: 12 }}>No Matching Donors</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>No donors found with Blood Group {selectedBloodGroup} in this location. Try expanding your search or filtering by another district.</p>
          </div>
        )}

        {/* Donors Grid */}
        {!loading && donors.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {donors.map(donor => (
              <div key={donor.id} className="glass-card donor-card" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'center', position: 'relative' }}>
                {user && user.role === 'admin' && (
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => {
                        setEditingDonorId(donor.id);
                        setRegForm({
                          name: donor.name,
                          blood_group: donor.blood_group,
                          phone: donor.phone,
                          district: donor.district,
                          location: donor.location
                        });
                        setShowRegModal(true);
                        setRegError('');
                        setRegSuccess('');
                      }} 
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, color: '#BEF264', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Edit Profile"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleAdminDeleteDonor(donor.id)} 
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, color: '#F87171', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Delete Profile"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                {/* Blood Group Indicator */}
                <div style={{ 
                  width: 60, height: 60, borderRadius: '50%', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  color: '#FCA5A5', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 900, fontSize: '1.25rem', flexShrink: 0,
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.15)'
                }}>
                  {donor.blood_group}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {donor.name}
                    </h3>
                    {user && user.id === donor.user_id && (
                      <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', fontSize: '0.65rem', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                        My Profile
                      </span>
                    )}
                  </div>
                  
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <MapPin size={14} color="#EF4444" style={{ flexShrink: 0 }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {donor.location}, {donor.district}
                    </span>
                  </div>

                  {/* Contact Action */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <a href={`tel:${donor.phone}`} style={{ 
                      flex: 1, textDecoration: 'none', background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', color: 'white', 
                      borderRadius: 8, padding: '8px 12px', fontSize: '0.85rem', fontWeight: 700, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' 
                    }} className="contact-link">
                      <Phone size={14} /> Call
                    </a>
                    <button onClick={() => copyPhone(donor.phone, donor.id)} style={{ 
                      flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', 
                      color: copiedId === donor.id ? '#BEF264' : 'rgba(255,255,255,0.7)', 
                      borderRadius: 8, padding: '8px 12px', fontSize: '0.85rem', fontWeight: 700, 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 
                    }}>
                      <Copy size={14} /> {copiedId === donor.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 44, 34, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 500, width: '100%', padding: 32, position: 'relative', background: 'rgba(6, 78, 59, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => { setShowRegModal(false); setEditingDonorId(null); }} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'white', padding: '6px' }}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Droplet size={24} fill="#EF4444" color="#EF4444" /> {editingDonorId ? 'Admin: Edit Donor Profile' : isRegistered ? 'Update Donor Profile' : 'Blood Donor Registration'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 24 }}>
              {editingDonorId ? 'Update details of this blood donor profile.' : 'Registering makes your profile visible to individuals in emergency need.'}
            </p>

            {regSuccess ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: 16, padding: 24, textAlign: 'center', margin: '20px 0' }}>
                <CheckCircle size={48} style={{ color: '#BEF264', marginBottom: 12 }} />
                <p style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{regSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterOrUpdate}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 6 }}>Full Name *</label>
                    <input type="text" required className="input-glass" value={regForm.name} 
                      onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 6 }}>Blood Group *</label>
                      <select className="input-glass" value={regForm.blood_group} 
                        onChange={e => setRegForm({ ...regForm, blood_group: e.target.value })}>
                        {BLOOD_GROUPS.map(bg => (
                          <option key={bg} value={bg} style={{ background: '#064E3B' }}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 6 }}>Phone Number *</label>
                      <input type="tel" required placeholder="017xxxxxxxx" className="input-glass" value={regForm.phone} 
                        onChange={e => setRegForm({ ...regForm, phone: e.target.value })} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 6 }}>District *</label>
                      <input type="text" required placeholder="e.g. Dhaka" className="input-glass" value={regForm.district} 
                        onChange={e => setRegForm({ ...regForm, district: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 6 }}>Area / Sub-location *</label>
                      <input type="text" required placeholder="e.g. Uttara" className="input-glass" value={regForm.location} 
                        onChange={e => setRegForm({ ...regForm, location: e.target.value })} />
                    </div>
                  </div>

                  {regError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <ShieldAlert size={18} color="#EF4444" />
                      <span style={{ color: '#FCA5A5', fontSize: '0.85rem' }}>{regError}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => { setShowRegModal(false); setEditingDonorId(null); }} 
                      style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel
                    </button>
                    {isRegistered && !editingDonorId && (
                      <button type="button" onClick={handleDeleteProfile} 
                        style={{ padding: '12px', borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid #EF4444', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button type="submit" disabled={regLoading}
                      style={{ flex: 2, padding: '12px', borderRadius: 12, background: '#EF4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem' }}>
                      {regLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
