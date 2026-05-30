import React, { useState } from 'react';
import { Heart, User, Lock, Eye, EyeOff, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import API from '../api';

export default function LoginPage({ navigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { id: 'patient',   label: 'Patient',   color: '#BEF264' },
    { id: 'doctor',    label: 'Doctor',    color: '#34D399' },
    { id: 'hospital',  label: 'Hospital',  color: '#60A5FA' },
    { id: 'insurance', label: 'Insurance', color: '#FBBF24' },
    { id: 'admin',     label: 'Admin',     color: '#F87171' },
  ];

  const demoAccounts = {
    patient:  { email: 'patient@uiu.health',   password: 'Demo@1234' },
    doctor:   { email: 'doctor@uiu.health',    password: 'Demo@1234' },
    hospital: { email: 'hospital@uiu.health',  password: 'Demo@1234' },
    insurance:{ email: 'insurance@uiu.health', password: 'Demo@1234' },
    admin:    { email: 'admin@uiu.health',     password: 'Demo@1234' },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    try {
      const response = await API.post('/api/auth/login', { email, password });
      setLoading(false);
      const user = response.data.user;
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user.role, user);
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.error || 'Invalid credentials or database connection failed.';
      setError(errMsg);
    }
  };

  const fillDemo = () => {
    const demo = demoAccounts[role];
    setEmail(demo.email);
    setPassword(demo.password);
  };

  const currentRole = roles.find(r => r.id === role);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#022C22', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .glass-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          outline: none;
          transition: border 0.2s;
        }
        .glass-input:focus {
          border-color: #BEF264;
        }
        .glass-input::placeholder {
          color: rgba(255,255,255,0.4);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
        }
      `}</style>

      {/* Left Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 60px', position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at 30% 50%, #059669 0%, #064E3B 40%, #022C22 100%)' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(190,242,100,0.15) 0%, transparent 70%)', top: -100, right: -100 }} />
        
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px', position: 'relative', zIndex: 10 }} onClick={() => navigate('home')}>
          <img src="/logo.png" alt="UIU HealthCare Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, color: 'white', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>UIU HealthCare</span>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px', position: 'relative', zIndex: 10 }}>
          Your Health Journey<br /><span style={{color: '#BEF264'}}>Starts Here</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '40px', maxWidth: 450, position: 'relative', zIndex: 10 }}>
          Bangladesh's most comprehensive advanced healthcare platform. Access world-class medical care from anywhere.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 10 }}>
          {[
            'Book appointments with verified experts',
            'Smart Medical Assistant available 24/7',
            'Secure electronic health records',
            'Emergency SOS with GPS tracking',
          ].map(item => (
            <div key={item} style={{ color: 'white', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500 }}>
              <div style={{ background: 'rgba(190,242,100,0.2)', padding: 4, borderRadius: '50%', display: 'flex' }}>
                <CheckCircle size={14} color="#BEF264" />
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', zIndex: 10 }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <button onClick={() => navigate('home')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 32, fontWeight: 600, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back to Home
          </button>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.5px' }}>Welcome Back</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '0.95rem' }}>Sign in to your secure UIU HealthCare account</p>

          {/* Role Selector */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>Access Portal As</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {roles.map(r => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  style={{ padding: '12px 4px', borderRadius: 12, border: `1px solid ${role === r.id ? r.color : 'rgba(255,255,255,0.1)'}`, background: role === r.id ? r.color + '22' : 'rgba(255,255,255,0.02)', color: role === r.id ? r.color : 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Demo Account Notice */}
          <div style={{ background: 'rgba(190,242,100,0.05)', border: '1px solid rgba(190,242,100,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Use demo <strong style={{color: '#BEF264', textTransform: 'capitalize'}}>{role}</strong> account?</span>
            <button onClick={fillDemo} style={{ fontSize: '0.85rem', color: '#BEF264', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Fill Demo →</button>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <AlertCircle size={18} color="#FCA5A5" />
              <span style={{ color: '#FCA5A5', fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '8px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                <input className="glass-input" style={{ paddingLeft: 46 }} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Password</label>
                <button type="button" style={{ fontSize: '0.8rem', color: '#BEF264', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                <input className="glass-input" style={{ paddingLeft: 46, paddingRight: 46 }} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: 14, background: '#BEF264', color: '#064E3B', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(190,242,100,0.3)', transition: 'transform 0.2s' }} disabled={loading} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(6,78,59,0.3)', borderTopColor: '#064E3B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Authenticating...
                </span>
              ) : `Sign In as ${currentRole?.label}`}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '32px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <button onClick={() => navigate('register')} style={{ color: '#BEF264', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Create Account</button>
          </p>
        </div>
      </div>
    </div>
  );
}
