import React from 'react';
import { Search, HeartPulse, Shield, Users, ActivitySquare, Award, ArrowRight } from 'lucide-react';

export default function AboutPage({ navigate }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header / Hero Section */}
      <div style={{ 
        background: 'radial-gradient(circle at 70% 50%, #059669 0%, #064E3B 40%, #022C22 100%)', 
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: '80px'
      }}>
        {/* DOT MATRIX BACKGROUND PATTERN */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.3 }}></div>

        {/* NAVBAR */}
        <nav style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('home')}>
            <img src="/logo.png" alt="UIU HealthCare" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white', letterSpacing: '-0.5px' }}>UIU HealthCare</span>
          </div>
          
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', gap: '4px', borderRadius: '40px' }}>
            <button onClick={() => navigate('home')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>Home</button>
            <button onClick={() => navigate('about')} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>About Us</button>
            <button onClick={() => navigate('hospitals')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>Hospitals</button>
            <button onClick={() => navigate('doctors')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>Doctors</button>
            <button onClick={() => navigate('forum')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', cursor: 'pointer' }}>Forum</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '30px' }}>
              <Search size={16} color="rgba(255,255,255,0.7)" />
              <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', marginLeft: '8px', width: '100px', fontSize: '0.9rem' }} />
            </div>
            <button onClick={() => navigate('login')} style={{ background: '#BEF264', color: '#064E3B', padding: '10px 24px', borderRadius: '30px', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}>
              Sign In
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10, marginTop: '80px', padding: '0 20px' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: '24px' }}>
            Pioneering the Future of <br />
            <span style={{ color: '#BEF264' }}>Digital Healthcare</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto' }}>
            UIU HealthCare is a unified telemedicine ecosystem breaking down the barriers between patients, doctors, hospitals, and insurance providers. We believe healthcare should be instant, transparent, and effortlessly accessible.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '-40px auto 100px', padding: '0 40px', position: 'relative', zIndex: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
        
        <div className="card p-8 animate-fade-in" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Users size={32} color="#38BDF8" />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>For Patients</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
            Empowering individuals with instant access to top-tier medical professionals. Book appointments, track wellness metrics, and manage insurance claims from a single unified dashboard.
          </p>
          <button style={{ background: 'none', border: 'none', color: '#38BDF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0 }} onClick={() => navigate('register')}>
            Join as a Patient <ArrowRight size={16} />
          </button>
        </div>

        <div className="card p-8 animate-fade-in" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', animationDelay: '0.1s' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(190, 242, 100, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <HeartPulse size={32} color="#BEF264" />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>For Doctors</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
            Equipping medical practitioners with cutting-edge tools. Seamlessly manage patient records, write digital prescriptions, and view deep analytics of patient health histories.
          </p>
          <button style={{ background: 'none', border: 'none', color: '#BEF264', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0 }} onClick={() => navigate('doctors')}>
            Join our Network <ArrowRight size={16} />
          </button>
        </div>

        <div className="card p-8 animate-fade-in" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', animationDelay: '0.2s' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Shield size={32} color="#A855F7" />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>For Hospitals</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
            Connecting enterprise healthcare centers with digital infrastructure. Streamline bed allocations, centralize medical reports, and integrate seamlessly with partner insurance agencies.
          </p>
          <button style={{ background: 'none', border: 'none', color: '#A855F7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0 }} onClick={() => navigate('hospitals')}>
            Partner with Us <ArrowRight size={16} />
          </button>
        </div>

      </div>

      {/* Vision & Goals Section */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 80px', padding: '0 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '24px' }}>Our Vision & Goals</h2>
        <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', textAlign: 'left', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '20px' }}>
            At UIU HealthCare, our vision is to democratize access to premium medical services through advanced technology. We aim to build a unified ecosystem where geographical barriers do not limit a patient's access to top-tier doctors and specialists.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7 }}>
            Our goal is to integrate AI-driven health analytics, secure cloud records, and seamless insurance claim processing into one single platform, creating a future where healthcare is instant, transparent, and built entirely around the patient's well-being.
          </p>
        </div>
      </div>

      {/* Founders Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 120px', padding: '0 40px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '48px', textAlign: 'center' }}>Meet the Founders</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
          
          {/* CEO */}
          <div className="card p-6" style={{ background: 'var(--card-bg)', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 24px', position: 'relative', overflow: 'hidden' }}>
              <img src="/founders/jaba.jpg" alt="Jaba Anika Kotha" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, #BEF264, #064E3B)', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 800 }}>
                JK
              </div>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Jaba Anika Kotha</h3>
            <div style={{ color: '#BEF264', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>CEO & Co-Founder</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Leading the strategic vision and operations of UIU HealthCare to revolutionize telemedicine.
            </p>
          </div>

          {/* CTO */}
          <div className="card p-6" style={{ background: 'var(--card-bg)', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 24px', position: 'relative', overflow: 'hidden' }}>
              <img src="/founders/seaman.jpg" alt="Shah Mohammed Seaman" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, #38BDF8, #0F172A)', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 800 }}>
                SS
              </div>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Shah Mohammed Seaman</h3>
            <div style={{ color: '#38BDF8', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>Founder & CTO</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Architecting the advanced technological infrastructure and AI systems powering our platform.
            </p>
          </div>

          {/* CFO */}
          <div className="card p-6" style={{ background: 'var(--card-bg)', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 24px', position: 'relative', overflow: 'hidden' }}>
              <img src="/founders/moinul.jpg" alt="Moinul Islam" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, #A855F7, #4C1D95)', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 800 }}>
                MI
              </div>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Moinul Islam</h3>
            <div style={{ color: '#A855F7', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>Co-Founder & CFO</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Managing financial growth, investments, and institutional healthcare partnerships.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#022C22', padding: '60px 40px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, opacity: 0.5 }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>UIU HealthCare © 2026</span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
