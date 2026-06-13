import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, Menu, X, ChevronDown, Phone, MapPin, Search, Play,
  Star, Shield, Users, Stethoscope, Clock, Activity, Calendar, Award, Brain, Pill, FileText,
  TrendingUp, ActivitySquare, HeartPulse
} from 'lucide-react';
import API from '../api';
import Draggable from 'react-draggable';

const doctors = [
  { name: 'Dr. Aisha Rahman', specialty: 'Cardiology', hospital: 'Dhaka Medical', rating: 4.9, reviews: 312, fee: '৳800', img: 'AR', available: true },
  { name: 'Dr. Karim Hassan', specialty: 'Neurology', hospital: 'Square Hospital', rating: 4.8, reviews: 248, fee: '৳1000', img: 'KH', available: true },
  { name: 'Dr. Priya Das', specialty: 'Pediatrics', hospital: 'Bangladesh Nat.', rating: 4.9, reviews: 421, fee: '৳600', img: 'PD', available: false },
  { name: 'Dr. Omar Sheikh', specialty: 'Dermatology', hospital: 'BSMMU', rating: 4.7, reviews: 189, fee: '৳700', img: 'OS', available: true },
  { name: 'Dr. Fatima Ali', specialty: 'Psychiatry', hospital: 'Apollo', rating: 4.8, reviews: 156, fee: '৳900', img: 'FA', available: true },
  { name: 'Dr. Rafi Islam', specialty: 'Orthopedics', hospital: 'Labaid', rating: 4.6, reviews: 203, fee: '৳850', img: 'RI', available: false },
];

export default function PublicHome({ navigate }) {
  const [topDoctors, setTopDoctors] = useState(doctors);
  const [liveStats, setLiveStats] = useState({
    patients: '50K+', doctors: '1,000+', hospitals: '100+', appointments: '847'
  });
  const dragRef1 = useRef(null);
  const dragRef2 = useRef(null);

  useEffect(() => {
    API.get('/api/doctors')
      .then(res => { if (res.data?.length > 0) setTopDoctors(res.data.slice(0, 6)); })
      .catch(err => console.error(err));

    API.get('/api/stats')
      .then(res => {
        if (res.data) {
          setLiveStats({
            patients: res.data.patients,
            doctors: res.data.doctors,
            hospitals: res.data.hospitals,
            appointments: res.data.appointments
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#022C22', minHeight: '100vh', color: 'white' }}>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
        }
      `}</style>

      {/* HERO SECTION WITH VIBRANT GRADIENT */}
      <div style={{ 
        background: 'radial-gradient(circle at 70% 50%, #059669 0%, #064E3B 40%, #022C22 100%)', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* DOT MATRIX BACKGROUND PATTERN (Subtle) */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.3 }}></div>

        {/* NAVBAR */}
        <nav style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('home')}>
            <img src="/logo.png" alt="UIU HealthCare" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white', letterSpacing: '-0.5px' }}>UIU HealthCare</span>
          </div>
          
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', gap: '4px', borderRadius: '40px' }}>
            <button onClick={() => navigate('home')} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>Home</button>
            <button onClick={() => navigate('about')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>About Us</button>
            <button onClick={() => navigate('hospitals')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>Hospitals</button>
            <button onClick={() => navigate('doctors')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>Doctors</button>
            <button onClick={() => navigate('forum')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>Forum</button>
            <button onClick={() => navigate('blood-donors')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>Blood Donors</button>
            <button onClick={() => navigate('mental-wellness')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>Wellness</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '30px' }}>
              <Search size={16} color="rgba(255,255,255,0.7)" />
              <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', marginLeft: '8px', width: '100px', fontSize: '0.9rem' }} />
            </div>
            <button onClick={() => navigate('login')} style={{ background: '#BEF264', color: '#064E3B', padding: '10px 24px', borderRadius: '30px', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(190, 242, 100, 0.3)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Sign In
            </button>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '80px 40px 120px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px', alignItems: 'center', position: 'relative', zIndex: 10 }}>
          
          {/* LEFT CONTENT */}
          <div>
            <div className="glass-card" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', marginBottom: '24px' }}>
              <div style={{ width: '8px', height: '8px', background: '#BEF264', borderRadius: '50%', boxShadow: '0 0 10px #BEF264' }}></div>
              <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>Advanced Healthcare Ecosystem</span>
            </div>
            
            <h1 style={{ fontSize: '4.8rem', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Smarter Healthcare<br/>
              Healthcare Starts<br/>
              With <span style={{ color: '#BEF264' }}>UIU HealthCare.</span>
            </h1>
            
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '48px', maxWidth: '500px' }}>
              UIU HealthCare is an advanced telemedicine platform built to seamlessly connect you with top doctors, hospitals, and insurance.
            </p>
            
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <button onClick={() => navigate('register')} style={{ background: '#BEF264', color: '#064E3B', padding: '18px 36px', borderRadius: '40px', fontWeight: 700, fontSize: '1.05rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(190, 242, 100, 0.3)' }}>
                Book a Free Consultation
              </button>
            </div>
          </div>
          
          {/* RIGHT CONTENT (Doctor Image & Glassmorphic Cards) */}
          <div style={{ position: 'relative', height: '600px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
            {/* Main Doctor Image */}
            <img 
              src="/doctor-hero-transparent.png" 
              alt="Doctor" 
              style={{ height: '115%', objectFit: 'contain', zIndex: 5, position: 'relative', transform: 'translateX(-80px)', maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
            />

            {/* Floating Card 1: Dashboard Report */}
            <Draggable bounds="parent" nodeRef={dragRef1}>
              <div ref={dragRef1} style={{ position: 'absolute', top: '20px', right: '-80px', zIndex: 10, cursor: 'grab' }}>
                <div className="glass-card" style={{ width: '280px', padding: '24px', animation: 'float 6s ease-in-out infinite' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '16px' }}>Health Analytics</div>
              <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '8px' }}>
                {/* Fake Chart Lines using SVG */}
                <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path d="M0,40 C10,30 20,45 30,20 C40,-5 50,25 60,10 C70,-5 80,15 100,5" fill="none" stroke="#BEF264" strokeWidth="2" />
                  <path d="M0,45 C15,40 25,50 40,35 C55,20 65,40 80,25 C90,15 95,20 100,10" fill="none" stroke="#38BDF8" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              </div>
                </div>
              </div>
            </Draggable>

            {/* Floating Card 2: Daily Progress */}
            <Draggable bounds="parent" nodeRef={dragRef2}>
              <div ref={dragRef2} style={{ position: 'absolute', bottom: '60px', right: '-40px', zIndex: 10, cursor: 'grab' }}>
                <div className="glass-card" style={{ width: '320px', padding: '24px', animation: 'float 7s ease-in-out infinite 1s', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#BEF264" strokeWidth="4" strokeDasharray="75, 100" />
                  <path d="M18 33.9155 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#A855F7" strokeWidth="4" strokeDasharray="30, 100" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>65</span>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>10,370</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HeartPulse size={16} color="#F472B6" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>Heart Pts</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>120</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ActivitySquare size={16} color="#BEF264" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>Steps</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>3,570</div>
                  </div>
                </div>
              </div>
                </div>
              </div>
            </Draggable>
            
          </div>
        </div>

        {/* PARTNERS SCROLLING MARQUEE (BREAKING NEWS STYLE) */}
        <div className="glass-card" style={{ 
          maxWidth: '1200px', margin: '0 auto', marginBottom: '40px', 
          overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative', zIndex: 10,
          padding: '24px 0', borderRadius: '24px'
        }}>
          <div style={{ display: 'inline-block', animation: 'marquee 25s linear infinite' }}>
            {/* Group 1 */}
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: 'white', opacity: 0.9 }}>Square Hospital</span>
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: '#BEF264', opacity: 0.9 }}>LabAid</span>
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: 'white', opacity: 0.9 }}>United Hospital</span>
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: '#BEF264', opacity: 0.9 }}>MetLife</span>
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: 'white', opacity: 0.9 }}>Evercare</span>
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: '#BEF264', opacity: 0.9 }}>Dhaka Medical</span>
            {/* Group 2 (Duplicate for infinite seamless scroll) */}
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: 'white', opacity: 0.9 }}>Square Hospital</span>
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: '#BEF264', opacity: 0.9 }}>LabAid</span>
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: 'white', opacity: 0.9 }}>United Hospital</span>
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: '#BEF264', opacity: 0.9 }}>MetLife</span>
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: 'white', opacity: 0.9 }}>Evercare</span>
            <span style={{ margin: '0 40px', fontSize: '1.75rem', fontWeight: 800, color: '#BEF264', opacity: 0.9 }}>Dhaka Medical</span>
          </div>
        </div>
      </div>

      {/* REMAINDER OF THE PAGE IN A DARK MODERN THEME */}
      
      {/* LIVE STATS BANNER */}
      <section style={{ padding: '60px 40px', background: '#022C22', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center' }}>
          {[
            { label: 'Total Patients', value: liveStats.patients },
            { label: 'Verified Doctors', value: liveStats.doctors },
            { label: 'Appointments Today', value: liveStats.appointments },
            { label: 'Partner Hospitals', value: liveStats.hospitals }
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1, letterSpacing: '-1px', color: '#BEF264' }}>{stat.value}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MEET DOCTORS */}
      <section style={{ padding: '80px 40px 120px', textAlign: 'center', background: '#064E3B' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '60px' }}>Meet our Experts</h2>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', marginBottom: '50px' }}>
          {topDoctors.slice(0,4).map(doc => (
            <div key={doc.name} className="glass-card" style={{ textAlign: 'left', padding: '16px', borderRadius: '16px', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ background: 'rgba(255,255,255,0.1)', height: '260px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                {doc.image ? (
                  <img src={doc.image} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BEF264', fontWeight: 800, fontSize: '4rem' }}>
                    {doc.img || doc.name.charAt(0)}
                  </div>
                )}
              </div>
              <div style={{ fontWeight: 800, color: 'white', fontSize: '1.2rem', marginBottom: '4px' }}>{doc.name}</div>
              <div style={{ color: '#BEF264', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>{doc.specialty}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> {doc.hospital}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('doctors')} style={{ background: 'transparent', border: '2px solid #BEF264', color: '#BEF264', padding: '14px 40px', borderRadius: '30px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#BEF264'; e.currentTarget.style.color = '#064E3B'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#BEF264'; }}>
          View all Doctors
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: '#022C22', padding: '60px 40px 40px', color: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            <img src="/logo.png" alt="UIU HealthCare Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, color: 'white', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>UIU HealthCare</span>
          </div>
          <p style={{ fontSize: '0.95rem', marginBottom: '40px', color: 'rgba(255,255,255,0.5)' }}>© 2026 UIU HealthCare Platform. Empowered by Technology.</p>
        </div>
      </footer>
    </div>
  );
}
