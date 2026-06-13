import React, { useState } from 'react';
import { Heart, ArrowLeft, Check, User, Mail, Phone, Lock, Eye, EyeOff, ChevronRight, AlertCircle } from 'lucide-react';
import API from '../api';

const steps = [
  { id: 1, title: 'Choose Role', subtitle: 'Select your account type' },
  { id: 2, title: 'Personal Info', subtitle: 'Tell us about yourself' },
  { id: 3, title: 'Security', subtitle: 'Secure your account' },
  { id: 4, title: 'Verify', subtitle: 'Confirm your identity' },
];

const roles = [
  { id: 'patient', label: 'Patient', icon: '🧑‍⚕️', desc: 'Book appointments, manage health records', color: '#BEF264' },
  { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️', desc: 'Manage patients and consultations', color: '#34D399' },
  { id: 'hospital', label: 'Hospital', icon: '🏥', desc: 'Manage departments and staff', color: '#60A5FA' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊', desc: 'Process orders and prescriptions', color: '#FBBF24' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️', desc: 'Manage claims and policies', color: '#F87171' },
];

export default function RegisterPage({ navigate }) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', bmdc_number: '' });
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const passwordStrength = () => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthColors = ['#F87171', '#FBBF24', '#FBBF24', '#34D399', '#34D399'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleCheckEmail = async () => {
    setError('');
    if (!form.name || !form.email || !form.phone) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address ending with a domain extension (e.g. name@mail.com).');
      return;
    }

    // Bangladesh phone validation
    let digits = form.phone.replace(/\D/g, '');
    if (digits.startsWith('880')) {
      digits = digits.substring(2);
    } else if (digits.startsWith('88')) {
      digits = '0' + digits.substring(2);
    }
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(digits)) {
      setError('Please enter a valid 11-digit Bangladesh phone number (e.g. 017XXXXXXXX).');
      return;
    }

    // Update form state with normalized phone
    update('phone', digits);

    setLoading(true);
    try {
      await API.post('/api/auth/check-email', { email: form.email });
      setLoading(false);
      setStep(3);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Email check failed.');
    }
  };

  const handleCheckPassword = () => {
    setError('');
    if (!form.password || !form.confirm) {
      setError('Please fill in both password fields.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (passwordStrength() < 3) {
      setError('Password is too weak. Ensure it has uppercase letters, numbers, and symbols.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setStep(4);
  };

  const currentRole = roles.find(r => r.id === selectedRole);

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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px', cursor: 'pointer', position: 'relative', zIndex: 10 }} onClick={() => navigate('home')}>
          <img src="/logo.png" alt="UIU HealthCare Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, color: 'white', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>UIU HealthCare</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '16px', letterSpacing: '-1px', position: 'relative', zIndex: 10 }}>Join Bangladesh's Largest <span style={{color: '#BEF264'}}>Healthcare Platform</span></h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '48px', lineHeight: 1.7, fontSize: '1.1rem', position: 'relative', zIndex: 10 }}>Create your account and get instant access to 1,000+ doctors, smart health assistant, and digital health records.</p>

        {/* Steps indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 10 }}>
          {steps.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: step > s.id ? '#BEF264' : step === s.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s', border: step === s.id ? '2px solid white' : 'none' }}>
                {step > s.id ? <Check size={18} color="#064E3B" style={{fontWeight: 800}} /> : <span style={{ color: step === s.id ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '1rem' }}>{s.id}</span>}
              </div>
              <div>
                <div style={{ color: step >= s.id ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '1rem' }}>{s.title}</div>
                <div style={{ color: step >= s.id ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>{s.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', zIndex: 10, overflowY: 'auto' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <button onClick={() => { setError(''); step > 1 ? setStep(s => s - 1) : navigate('home'); }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 32, fontWeight: 600, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> {step > 1 ? 'Back' : 'Home'}
          </button>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.5px' }}>Select Your Role</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '0.95rem' }}>Choose how you'll use UIU HealthCare</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {roles.map(r => (
                  <div key={r.id} onClick={() => setSelectedRole(r.id)}
                    style={{ padding: '16px 20px', borderRadius: 16, border: `1px solid ${selectedRole === r.id ? r.color : 'rgba(255,255,255,0.1)'}`, background: selectedRole === r.id ? r.color + '22' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '2rem' }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: 'white', fontSize: '1.1rem', marginBottom: 4 }}>{r.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{r.desc}</div>
                    </div>
                    {selectedRole === r.id && <Check size={24} color={r.color} />}
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', marginTop: '32px', padding: '16px', fontSize: '1rem', borderRadius: 14, background: '#BEF264', color: '#064E3B', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: selectedRole ? 1 : 0.5 }} onClick={() => selectedRole && setStep(2)} disabled={!selectedRole}>
                Continue <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.5px' }}>Personal Information</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '0.95rem' }}>Tell us about yourself</p>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <AlertCircle size={18} color="#FCA5A5" />
                  <span style={{ color: '#FCA5A5', fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '8px' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                    <input className="glass-input" style={{ paddingLeft: 46 }} placeholder="Your full name" value={form.name} onChange={e => update('name', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '8px' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                    <input className="glass-input" style={{ paddingLeft: 46 }} type="email" placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '8px' }}>Phone Number (Bangladesh)</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                    <input className="glass-input" style={{ paddingLeft: 46 }} placeholder="+880 1XXX-XXXXXX" value={form.phone} onChange={e => update('phone', e.target.value)} />
                  </div>
                </div>
                {selectedRole === 'doctor' && (
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '8px' }}>BMDC Registration Number</label>
                    <input className="glass-input" placeholder="A-12345" value={form.bmdc_number} onChange={e => update('bmdc_number', e.target.value)} />
                  </div>
                )}
              </div>
              <button style={{ width: '100%', marginTop: '32px', padding: '16px', fontSize: '1rem', borderRadius: 14, background: '#BEF264', color: '#064E3B', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleCheckEmail} disabled={loading}>
                {loading ? 'Checking...' : 'Continue'} <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.5px' }}>Create Password</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '0.95rem' }}>Must be at least 8 characters with uppercase, number and symbol</p>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <AlertCircle size={18} color="#FCA5A5" />
                  <span style={{ color: '#FCA5A5', fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '8px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                    <input className="glass-input" style={{ paddingLeft: 46, paddingRight: 46 }} type={showPass ? 'text' : 'password'} placeholder="Create a strong password" value={form.password} onChange={e => update('password', e.target.value)} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {form.password && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= passwordStrength() ? strengthColors[passwordStrength()] : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: strengthColors[passwordStrength()], fontWeight: 700 }}>{strengthLabels[passwordStrength()]}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '8px' }}>Confirm Password</label>
                  <input className="glass-input" type="password" placeholder="Repeat your password" value={form.confirm} onChange={e => update('confirm', e.target.value)}
                    style={{ border: form.confirm && form.confirm !== form.password ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)' }} />
                  {form.confirm && form.confirm !== form.password && (
                    <span style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '6px', display: 'block' }}>Passwords do not match</span>
                  )}
                </div>
              </div>
              <button style={{ width: '100%', marginTop: '32px', padding: '16px', fontSize: '1rem', borderRadius: 14, background: '#BEF264', color: '#064E3B', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleCheckPassword}>
                Continue <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Step 4: Verify */}
          {step === 4 && (
            <>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.5px' }}>Verify Your Account</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '0.95rem' }}>We've sent a 6-digit code to your email and phone</p>
              
              <div style={{ background: 'rgba(190, 242, 100, 0.1)', border: '1px solid rgba(190, 242, 100, 0.2)', borderRadius: 12, padding: '16px', marginBottom: '32px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                <strong>💡 Demo Mode Active:</strong> Since SMS/Email gateways are not configured in this local environment, please enter the test OTP code: <span style={{ fontWeight: 900, color: '#BEF264', fontSize: '1.1rem', letterSpacing: '2px' }}>123456</span> to complete registration.
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <AlertCircle size={18} color="#FCA5A5" />
                  <span style={{ color: '#FCA5A5', fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
                {otp.map((digit, i) => (
                  <input key={i} type="text" maxLength={1} value={digit}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/, '');
                      const newOtp = [...otp]; newOtp[i] = val; setOtp(newOtp);
                      if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                    }}
                    id={`otp-${i}`}
                    style={{ width: 56, height: 64, textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, color: 'white', border: `1px solid ${digit ? '#BEF264' : 'rgba(255,255,255,0.2)'}`, borderRadius: 14, background: digit ? 'rgba(190,242,100,0.1)' : 'rgba(255,255,255,0.05)', outline: 'none', transition: 'all 0.2s' }} />
                ))}
              </div>
              <button style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: 14, background: '#BEF264', color: '#064E3B', fontWeight: 800, border: 'none', cursor: 'pointer' }} disabled={loading} onClick={async () => {
                setError('');
                const enteredOtp = otp.join('');
                if (enteredOtp !== '123456') {
                  setError('Invalid OTP code. Please enter 123456.');
                  return;
                }
                setLoading(true);
                try {
                  await API.post('/api/auth/register', {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                    role: selectedRole,
                    bmdc_number: form.bmdc_number
                  });
                  setLoading(false);
                  navigate('login');
                } catch (err) {
                  setLoading(false);
                  setError(err.response?.data?.error || 'Registration failed. Check database connection.');
                }
              }}>
                {loading ? 'Registering...' : 'Complete Registration ✓'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                Didn't receive code? <button style={{ color: '#BEF264', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Resend</button>
              </p>
            </>
          )}

          {step < 4 && (
            <p style={{ textAlign: 'center', marginTop: '32px', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
              Already have an account?{' '}
              <button onClick={() => navigate('login')} style={{ color: '#BEF264', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Sign In</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
