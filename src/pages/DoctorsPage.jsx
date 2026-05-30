import React, { useState, useEffect } from 'react';
import { Heart, Search, Star, Filter, ArrowLeft, Video, MapPin, Calendar, CheckCircle, X, ShieldAlert, Award, Clock, Phone, AlertCircle, Loader } from 'lucide-react';
import API from '../api';

const SPECIALTY_COLORS = {
  'Cardiology':   '#EF4444',
  'Neurology':    '#8B5CF6',
  'Pediatrics':   '#10B981',
  'Dermatology':  '#F59E0B',
  'Psychiatry':   '#6366F1',
  'Orthopedics':  '#0EA5E9',
};

const STATIC_DOCTORS = [
  { id: 1, name: 'Dr. Aisha Rahman', specialty: 'Cardiology',  hospital: 'Dhaka Medical',   rating: 4.9, reviews: 312, fee: '৳800',  image_initials: 'AR', exp: '15 years', avail_text: 'Today',        phone: '+880 1712-345678', degree: 'MBBS, FCPS (Cardiology)'  },
  { id: 2, name: 'Dr. Karim Hassan', specialty: 'Neurology',   hospital: 'Square Hospital', rating: 4.8, reviews: 248, fee: '৳1000', image_initials: 'KH', exp: '12 years', avail_text: 'Tomorrow',     phone: '+880 1712-345679', degree: 'MBBS, MD (Neurology)'     },
  { id: 3, name: 'Dr. Priya Das',    specialty: 'Pediatrics',  hospital: 'Bangladesh Nat.', rating: 4.9, reviews: 421, fee: '৳600',  image_initials: 'PD', exp: '8 years',  avail_text: 'Wed, Oct 16', phone: '+880 1712-345680', degree: 'MBBS, DCH (Pediatrics)'   },
  { id: 4, name: 'Dr. Omar Sheikh',  specialty: 'Dermatology', hospital: 'BSMMU',           rating: 4.7, reviews: 189, fee: '৳700',  image_initials: 'OS', exp: '10 years', avail_text: 'Today',        phone: '+880 1712-345681', degree: 'MBBS, DDV (Dermatology)'  },
  { id: 5, name: 'Dr. Fatima Ali',   specialty: 'Psychiatry',  hospital: 'Apollo',          rating: 4.8, reviews: 156, fee: '৳900',  image_initials: 'FA', exp: '14 years', avail_text: 'Tomorrow',     phone: '+880 1712-345682', degree: 'MBBS, FCPS (Psychiatry)' },
  { id: 6, name: 'Dr. Rafi Islam',   specialty: 'Orthopedics', hospital: 'Labaid',          rating: 4.6, reviews: 203, fee: '৳850',  image_initials: 'RI', exp: '18 years', avail_text: 'Thu, Oct 17', phone: '+880 1712-345683', degree: 'MBBS, MS (Orthopedics)'   },
];

export default function DoctorsPage({ navigate, user }) {
  const [search, setSearch]                   = useState('');
  const [selectedDoctor, setSelectedDoctor]   = useState(null);
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [simulateEmpty, setSimulateEmpty]     = useState(false);
  const [doctors, setDoctors]                 = useState(STATIC_DOCTORS);
  const [loadingDoctors, setLoadingDoctors]   = useState(false);

  // Booking modal state
  const [showBooking, setShowBooking]         = useState(false);
  const [bookingDoctor, setBookingDoctor]     = useState(null);
  const [bookDate, setBookDate]               = useState('');
  const [bookTime, setBookTime]               = useState('09:00');
  const [bookType, setBookType]               = useState('In-Person');
  const [bookNotes, setBookNotes]             = useState('');
  const [bookLoading, setBookLoading]         = useState(false);
  const [bookError, setBookError]             = useState('');
  const [bookSuccess, setBookSuccess]         = useState('');

  // Fetch doctors from backend (fallback to static)
  useEffect(() => {
    setLoadingDoctors(true);
    API.get('/api/doctors')
      .then(res => { if (res.data?.length > 0) setDoctors(res.data); })
      .catch(() => { /* use static fallback */ })
      .finally(() => setLoadingDoctors(false));
  }, []);

  const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Psychiatry', 'Orthopedics'];

  const filteredDoctors = (simulateEmpty ? [] : doctors).filter(doc => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      doc.name.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.hospital.toLowerCase().includes(q);
    const matchSpec = activeSpecialty === 'All' || doc.specialty === activeSpecialty;
    return matchSearch && matchSpec;
  });

  const openBooking = (doc) => {
    if (!user) {
      // Not logged in — take to login
      navigate('login');
      return;
    }
    setBookingDoctor(doc);
    setBookDate('');
    setBookTime('09:00');
    setBookType('In-Person');
    setBookNotes('');
    setBookError('');
    setBookSuccess('');
    setSelectedDoctor(null);
    setShowBooking(true);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookError('');
    setBookSuccess('');
    if (!bookDate || !bookTime) {
      setBookError('Please select a date and time.');
      return;
    }
    setBookLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await API.post(
        '/api/appointments',
        { doctor_id: bookingDoctor.id, date: bookDate, time: bookTime, type: bookType, notes: bookNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookSuccess(`✅ Appointment booked! Your reference: ${res.data.ref_code}`);
      setBookLoading(false);
    } catch (err) {
      setBookLoading(false);
      setBookError(err.response?.data?.error || 'Failed to book appointment. Please try again.');
    }
  };

  const accentColor = (doc) => SPECIALTY_COLORS[doc?.specialty] || '#2563EB';

  return (
    <div style={{ background: '#022C22', minHeight: '100vh', paddingBottom: 60, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      
      {/* CSS Animations & Glassmorphism */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }
        .input-glass {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }
        .input-glass::placeholder {
          color: rgba(255,255,255,0.5);
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'radial-gradient(circle at 50% -20%, #059669 0%, #064E3B 40%, #022C22 100%)', padding: '40px 32px 60px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
            <button onClick={() => navigate(user ? 'patient-dashboard' : 'home')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', padding: '10px', cursor: 'pointer' }}><ArrowLeft size={24}/></button>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>Find an Expert</h1>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 280, maxWidth: 600 }}>
              <Search size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
              <input type="text" placeholder="Search by doctor name, specialty, or hospital..." className="input-glass"
                style={{ paddingLeft: 52, paddingRight: 16, height: 60, fontSize: '1rem', width: '100%', borderRadius: 30, outline: 'none' }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setSimulateEmpty(p => !p)} style={{ background: simulateEmpty ? '#EF4444' : '#BEF264', color: simulateEmpty ? 'white' : '#064E3B', height: 60, borderRadius: 30, padding: '0 32px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              {simulateEmpty ? 'Show Doctors' : 'Simulate Empty'}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1280, margin: '-20px auto 0', padding: '0 32px' }}>
        {/* Specialty pills */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 20, marginBottom: 20, scrollbarWidth: 'none' }}>
          {specialties.map(spec => (
            <button key={spec} onClick={() => setActiveSpecialty(spec)}
              style={{ padding: '10px 24px', borderRadius: 30, border: '1px solid rgba(255,255,255,0.2)', 
                background: activeSpecialty === spec ? '#BEF264' : 'rgba(255,255,255,0.05)',
                color: activeSpecialty === spec ? '#064E3B' : 'white', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {spec}
            </button>
          ))}
        </div>

        {loadingDoctors && (
          <div style={{ textAlign: 'center', padding: 40, color: '#BEF264' }}>
            <Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
            <p>Loading doctors...</p>
          </div>
        )}

        {/* Empty state */}
        {!loadingDoctors && filteredDoctors.length === 0 && (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
            <ShieldAlert size={64} style={{ color: '#BEF264', marginBottom: 20, opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: 12 }}>No doctors available</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>No verified doctors found{search ? ` matching "${search}"` : ''}. Try adjusting your search or specialty filter.</p>
          </div>
        )}

        {/* Doctor Grid */}
        {!loadingDoctors && filteredDoctors.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))', gap: 24 }}>
            {filteredDoctors.map(doc => {
              return (
                <div key={doc.id || doc.name} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, transition: 'transform 0.3s' }}
                     onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {doc.image ? (
                      <img src={doc.image} alt={doc.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(190,242,100,0.15)', color: '#BEF264', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>
                        {doc.image_initials || doc.img || doc.name.charAt(0)}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{doc.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <CheckCircle size={14} color="#10B981" />
                            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>Verified</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.1)', color: '#FCD34D', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                          <Star size={12} fill="#FCD34D" color="#FCD34D"/> {doc.rating}
                        </div>
                      </div>
                      <div style={{ color: '#BEF264', fontWeight: 600, fontSize: '0.9rem', marginTop: 8 }}>{doc.specialty}</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><MapPin size={12}/>{doc.hospital}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Experience</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{doc.exp}</div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Consultation Fee</div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#BEF264' }}>{doc.fee}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                    <button onClick={() => setSelectedDoctor(doc)} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: '0.9rem', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600 }}>Profile</button>
                    <button onClick={() => openBooking(doc)} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: '0.9rem', background: '#BEF264', color: '#064E3B', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Book Now</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 44, 34, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 500, width: '100%', padding: 32, position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', background: 'rgba(6, 78, 59, 0.9)' }}>
            <button onClick={() => setSelectedDoctor(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'white', padding: '6px' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, marginBottom: 24 }}>
              {selectedDoctor.image ? (
                <img src={selectedDoctor.image} alt={selectedDoctor.name} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(190,242,100,0.1)', color: '#BEF264', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '2rem' }}>
                  {selectedDoctor.image_initials || selectedDoctor.img || selectedDoctor.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>{selectedDoctor.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6 }}>
                  <CheckCircle size={16} color="#10B981" />
                  <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 700 }}>Verified Medical Practitioner</span>
                </div>
              </div>
              <div style={{ background: 'rgba(190,242,100,0.15)', color: '#BEF264', padding: '6px 20px', borderRadius: 20, fontWeight: 700, fontSize: '0.9rem' }}>{selectedDoctor.specialty}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(0,0,0,0.2)', padding: 24, borderRadius: 20, marginBottom: 24 }}>
              {[
                { Icon: Award,    label: 'Qualifications', val: selectedDoctor.degree },
                { Icon: MapPin,   label: 'Hospital',        val: selectedDoctor.hospital },
                { Icon: Clock,    label: 'Availability',    val: (selectedDoctor.avail_text || selectedDoctor.avail) + ' (Next Session)' },
                { Icon: Phone,    label: 'Contact',         val: selectedDoctor.phone },
              ].map(({ Icon, label, val }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%' }}>
                    <Icon size={18} style={{ color: '#BEF264', flexShrink: 0 }} />
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 700 }}>{label}</div>
                    <div style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setSelectedDoctor(null)} style={{ flex: 1, padding: '14px', borderRadius: 16, background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600 }}>Close</button>
              <button onClick={() => openBooking(selectedDoctor)} style={{ flex: 2, padding: '14px', borderRadius: 16, background: '#BEF264', color: '#064E3B', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}>
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && bookingDoctor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 44, 34, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 520, width: '100%', padding: 40, position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', background: 'rgba(6, 78, 59, 0.95)' }}>
            <button onClick={() => setShowBooking(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'white', padding: '6px' }}>
              <X size={20}/>
            </button>

            <h2 style={{ fontWeight: 800, fontSize: '1.6rem', color: 'white', marginBottom: 6 }}>Book Appointment</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginBottom: 30 }}>with <strong style={{color: '#BEF264'}}>{bookingDoctor.name}</strong></p>

            {bookSuccess ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                <CheckCircle size={48} style={{ color: '#BEF264', marginBottom: 16 }} />
                <p style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.5 }}>{bookSuccess}</p>
                <button onClick={() => { setShowBooking(false); navigate('patient-dashboard'); }} style={{ marginTop: 24, background: '#BEF264', color: '#064E3B', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Go to Dashboard</button>
              </div>
            ) : (
              <form onSubmit={handleBook}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 8 }}>Appointment Date *</label>
                    <input type="date" required className="input-glass" value={bookDate} onChange={e => setBookDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: '0.95rem', colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 8 }}>Appointment Time *</label>
                    <input type="time" required className="input-glass" value={bookTime} onChange={e => setBookTime(e.target.value)}
                      style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: '0.95rem', colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 8 }}>Consultation Type *</label>
                    <select className="input-glass" value={bookType} onChange={e => setBookType(e.target.value)}
                      style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: '0.95rem' }}>
                      <option style={{background: '#064E3B'}} value="In-Person">In-Person Visit</option>
                      <option style={{background: '#064E3B'}} value="Video Call">Video Call</option>
                      <option style={{background: '#064E3B'}} value="Phone Call">Phone Consultation</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 8 }}>Notes / Reason for Visit</label>
                    <textarea className="input-glass" value={bookNotes} onChange={e => setBookNotes(e.target.value)} rows={3}
                      placeholder="Describe your symptoms or reason for visit..."
                      style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: '0.9rem', resize: 'vertical' }} />
                  </div>

                  {bookError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <AlertCircle size={18} color="#EF4444" />
                      <span style={{ color: '#FCA5A5', fontSize: '0.9rem' }}>{bookError}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <button type="button" onClick={() => setShowBooking(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: 14, background: '#BEF264', color: '#064E3B', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }} disabled={bookLoading}>
                      {bookLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                          <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Booking...
                        </span>
                      ) : `Confirm — ${bookingDoctor.fee}`}
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
