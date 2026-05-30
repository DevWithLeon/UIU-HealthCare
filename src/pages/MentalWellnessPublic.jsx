import React from 'react';
import { Brain, Heart, Wind, Music, Smile, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MentalWellnessPublic({ navigate }) {
  const tools = [
    { title: 'PHQ-9 Depression Screening', desc: 'Standardized clinical assessment tool to evaluate depression severity.', icon: Brain, color: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'GAD-7 Anxiety Assessment', desc: 'Screening tool to identify and measure generalized anxiety disorder.', icon: Activity, color: '#F59E0B', bg: '#FFFBEB' },
    { title: 'Guided Breathing Exercises', desc: 'Interactive 4-7-8 and box breathing routines to lower heart rate.', icon: Wind, color: '#10B981', bg: '#ECFDF5' },
    { title: 'Daily Mood Journal', desc: 'Track your emotional patterns over time with private analytics.', icon: Smile, color: '#EC4899', bg: '#FDF2F8' },
    { title: 'Meditation Sessions', desc: 'Audio sessions ranging from 5 to 30 minutes for mindfulness.', icon: Music, color: '#3B82F6', bg: '#EFF6FF' }
  ];

  function Activity({ size }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>; }

  return (
    <div style={{ background: '#022C22', minHeight: '100vh', paddingBottom: 80, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
      `}</style>
      
      {/* Header */}
      <div style={{ background: 'radial-gradient(circle at 50% -20%, #059669 0%, #064E3B 40%, #022C22 100%)', padding: '40px 32px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
            <button onClick={() => navigate('home')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', padding: '10px', cursor: 'pointer' }}>
              <ArrowLeft size={24}/>
            </button>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>Mental Wellness</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: 650 }}>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: 'white', letterSpacing: '-1px' }}>Your Mind <span style={{color: '#BEF264'}}>Matters.</span></h2>
              <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 36 }}>Access clinical screening tools, guided exercises, and professional therapists in a secure, judgment-free environment.</p>
              <button style={{ background: '#BEF264', color: '#064E3B', padding: '16px 36px', fontSize: '1.15rem', borderRadius: 30, fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('login')} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Login to Access Tools
              </button>
            </div>
            <div className="hidden md:flex" style={{ width: 260, height: 260, background: 'rgba(190, 242, 100, 0.1)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(190, 242, 100, 0.2)', boxShadow: '0 0 40px rgba(190,242,100,0.1)' }}>
              <Brain size={110} color="#BEF264" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1280, margin: '-40px auto 0', padding: '0 32px' }}>
        <div className="glass-card" style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginBottom: 60, position: 'relative', zIndex: 10, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#BEF264' }}>100%</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 8, fontSize: '1.1rem' }}>Confidential & Secure</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#BEF264' }}>5+</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 8, fontSize: '1.1rem' }}>Clinical Assessments</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#BEF264' }}>24/7</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 8, fontSize: '1.1rem' }}>Access to Resources</div>
          </div>
        </div>

        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: 40, textAlign: 'center', letterSpacing: '-0.5px' }}>Available Wellness Tools</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {tools.map(tool => (
            <div key={tool.title} className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', transition: 'transform 0.3s' }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(190,242,100,0.1)', color: '#BEF264', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <tool.icon size={32} />
              </div>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: 12 }}>{tool.title}</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 30, flex: 1, fontSize: '1rem' }}>{tool.desc}</p>
              <button style={{ color: '#BEF264', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: 12, cursor: 'pointer', fontSize: '0.95rem', transition: 'background 0.2s' }} onClick={() => navigate('login')}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                Unlock Tool <ArrowRight size={18}/>
              </button>
            </div>
          ))}
          
          <div className="glass-card" style={{ padding: 40, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.4), rgba(255,255,255,0.05))' }}>
            <Heart size={48} color="#BEF264" fill="rgba(190,242,100,0.2)" style={{ marginBottom: 24 }} />
            <h4 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>Need to talk?</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 32, fontSize: '1.05rem' }}>Connect with verified psychiatrists and clinical psychologists via private video consultation.</p>
            <button style={{ background: 'white', color: '#022C22', width: 'fit-content', padding: '14px 28px', borderRadius: 14, fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer' }} onClick={() => navigate('doctors')}>Find a Therapist</button>
          </div>
        </div>
      </div>
    </div>
  );
}
