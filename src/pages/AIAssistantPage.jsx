import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, ArrowLeft, Send, Info, Loader } from 'lucide-react';
import API from '../api';

export default function AIAssistantPage({ navigate, user }) {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your Smart Medical Assistant. I can help explain symptoms, provide health information, or suggest the right type of doctor to see. Please note that my advice does not replace professional medical consultation. How can I help you today?", 
      sender: 'ai', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  const chatEndRef = useRef(null);

  // Initialize session ID
  useEffect(() => {
    // Basic unique session ID per tab/session
    const sid = user ? `user_${user.id}_${Date.now()}` : `guest_${Date.now()}`;
    setSessionId(sid);
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message to UI
    const newUserMsgObj = { id: Date.now(), text: userMsg, sender: 'user', time: now };
    setMessages(prev => [...prev, newUserMsgObj]);
    setInput('');
    setLoading(true);

    try {
      // Build history payload (last 10 messages)
      const historyToSent = messages.map(m => ({ sender: m.sender, text: m.text }));
      
      const res = await API.post('/api/chat', {
        message: userMsg,
        session_id: sessionId,
        history: historyToSent
      });

      const aiText = res.data.response || "I'm sorry, I encountered an error while processing your request.";
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: aiText, 
        sender: 'ai', 
        time: aiTime 
      }]);
    } catch (err) {
      console.error(err);
      let errorMsg = "Sorry, I am having trouble connecting to my brain right now.";
      if (err.response?.status === 401) {
        errorMsg = "The chatbot service is misconfigured (missing/invalid API key). Please contact the administrator.";
      } else if (err.response?.status === 429) {
        errorMsg = "I'm receiving too many requests right now. Please try again in a minute.";
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `Error: ${errorMsg}`, 
        sender: 'ai', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestions = [
    "What are the symptoms of dengue?",
    "Should I see a cardiologist or neurologist?",
    "How to manage high blood pressure?",
    "What does a complete blood count (CBC) test show?"
  ];

  return (
    <div style={{ background: '#022C22', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .glass-input {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s;
        }
        .glass-input:focus {
          border-color: #BEF264;
          box-shadow: 0 0 0 2px rgba(190,242,100,0.2);
        }
        .glass-input::placeholder {
          color: rgba(255,255,255,0.4);
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ background: 'radial-gradient(circle at 50% -20%, #059669 0%, #064E3B 40%, #022C22 100%)', padding: '20px 32px', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button onClick={() => navigate(user ? 'patient-dashboard' : 'home')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', padding: '10px', cursor: 'pointer' }}>
              <ArrowLeft size={20}/>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'rgba(190,242,100,0.15)', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BEF264' }}>
                <Bot size={28} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2, margin: 0, letterSpacing: '-0.5px' }}>Smart Medical Assistant</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#BEF264', boxShadow: '0 0 10px #BEF264' }}></span> Online (Llama 3 Base)
                </div>
              </div>
            </div>
          </div>
          {!user && (
            <button style={{ background: 'transparent', border: '1px solid rgba(190,242,100,0.5)', color: '#BEF264', padding: '8px 16px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('login')}>
              Login to Save History
            </button>
          )}
        </div>
      </div>

      <div style={{ background: 'rgba(190,242,100,0.1)', padding: '12px 32px', borderBottom: '1px solid rgba(190,242,100,0.2)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, color: '#BEF264', fontSize: '0.875rem', fontWeight: 600 }}>
          <Info size={18}/> This information is for educational purposes only and does not constitute medical advice.
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', gap: 16, flexDirection: m.sender === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: m.sender === 'user' ? 'rgba(255,255,255,0.1)' : '#BEF264', color: m.sender === 'user' ? 'white' : '#064E3B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: m.sender === 'ai' ? '0 0 15px rgba(190,242,100,0.3)' : 'none' }}>
                {m.sender === 'user' ? <User size={20}/> : <Bot size={20}/>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                <div style={{ 
                  background: m.sender === 'user' ? '#BEF264' : 'rgba(255,255,255,0.05)', 
                  color: m.sender === 'user' ? '#064E3B' : 'white',
                  padding: '16px 20px', 
                  borderRadius: 20, 
                  borderTopRightRadius: m.sender === 'user' ? 4 : 20,
                  borderTopLeftRadius: m.sender === 'ai' ? 4 : 20,
                  backdropFilter: m.sender === 'ai' ? 'blur(16px)' : 'none',
                  border: m.sender === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', // preserve formatting
                  fontWeight: m.sender === 'user' ? 600 : 400
                }}>
                  {m.text}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 8, fontWeight: 600 }}>{m.time}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#BEF264', color: '#064E3B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 15px rgba(190,242,100,0.3)' }}><Bot size={20}/></div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: 20, borderTopLeftRadius: 4, backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 8, height: 8, background: '#BEF264', borderRadius: '50%', animation: 'pulse-glow 1s infinite' }}></span>
                <span style={{ width: 8, height: 8, background: '#BEF264', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.2s' }}></span>
                <span style={{ width: 8, height: 8, background: '#BEF264', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{ padding: '0 32px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {messages.length === 1 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setInput(s); setTimeout(sendMessage, 100); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: 20, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.borderColor = '#BEF264'; e.target.style.color = '#BEF264'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = 'rgba(255,255,255,0.8)'; }}>
                  {s}
                </button>
              ))}
            </div>
          )}
          
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="glass-input"
              placeholder="Type your health-related question here..." 
              style={{ width: '100%', padding: '20px 80px 20px 24px', borderRadius: 24, fontSize: '1rem', outline: 'none' }} 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button 
              onClick={sendMessage}
              disabled={loading}
              style={{ position: 'absolute', right: 12, top: 12, width: 44, height: 44, borderRadius: '50%', background: input.trim() && !loading ? '#BEF264' : 'rgba(255,255,255,0.1)', color: input.trim() && !loading ? '#064E3B' : 'rgba(255,255,255,0.3)', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: input.trim() && !loading ? '0 0 15px rgba(190,242,100,0.3)' : 'none' }}
            >
              <Send size={20} />
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Automated responses can make mistakes. Always verify with a doctor.</div>
        </div>
      </div>
    </div>
  );
}
