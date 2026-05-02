import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, User, Lock, Home, Stethoscope, MessageSquare, Brain, 
  Bell, ArrowLeft, Wind, Droplet, Thermometer, AlertTriangle, 
  Phone, MapPin, FileText, Activity, Calendar, Clock, Settings, LogOut, ChevronRight, Music, Timer, Send, Bot, X, Play, RotateCcw
} from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const navigate = (page) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF8F6] font-sans text-slate-800 pb-28">
      {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
      {currentPage === 'home' && <HomePage onNavigate={navigate} />}
      {currentPage === 'symptoms' && (
        <SymptomsPage 
          onNavigate={navigate} 
          selectedSymptoms={selectedSymptoms} 
          toggleSymptom={toggleSymptom} 
        />
      )}
      {currentPage === 'mental' && <MentalHealthPage onNavigate={navigate} />}
      {currentPage === 'chat' && <ChatPage onNavigate={navigate} />}
      {currentPage === 'emergency' && <EmergencyPage onNavigate={navigate} />}
      {currentPage === 'hospitals' && <HospitalsPage onNavigate={navigate} />}
      {currentPage === 'profile' && <ProfilePage onNavigate={navigate} />}

      {currentPage !== 'login' && <BottomNav currentPage={currentPage} onNavigate={navigate} />}
    </div>
  );
}

/* --- REUSABLE COMPONENTS --- */

// Consistent Header for all pages based on your design style
function StandardHeader({ title, subtitle, onBack, showProfile = false }) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-b-[50px] text-white shadow-md relative overflow-hidden">
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-5">
          {onBack ? (
            <button onClick={onBack} className="bg-white/20 p-2.5 rounded-full hover:bg-white/30 transition-colors">
              <ArrowLeft size={22} />
            </button>
          ) : (
             <div className="bg-white/20 p-3 rounded-2xl"><User className="w-7 h-7" /></div>
          )}
          <div>
            <h2 className="font-bold text-2xl tracking-tight leading-tight">{title}</h2>
            <p className="text-xs opacity-80 font-medium">{subtitle}</p>
          </div>
        </div>
        {showProfile ? (
          <button className="bg-white/20 p-3 rounded-full"><Bell className="w-6 h-6" /></button>
        ) : (
          <div className="bg-white/20 p-3 rounded-full opacity-50"><Heart size={20} fill="white"/></div>
        )}
      </div>
    </div>
  );
}

function Modal({ isOpen, onClose, title, icon, colorClass, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 z-10">
          <X size={20} />
        </button>
        <div className="p-8">
          <div className={`w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-current/20`}>
            {React.cloneElement(icon, { size: 28, className: "text-white" })}
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}

/* --- 1. LOGIN PAGE --- */
function LoginPage({ onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-gradient-to-b from-orange-500 to-red-500 p-4 rounded-3xl mb-6 shadow-lg">
        <Heart className="w-12 h-12 text-white" fill="white" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">UIU Smart Health</h1>
      <p className="text-slate-500 mb-10">Your Personal Health Assistant</p>
      <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-sm border border-slate-100">
        <h2 className="text-2xl font-semibold mb-6">Welcome Back</h2>
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Student ID" className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <input type="password" placeholder="Password" className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <button onClick={() => onNavigate('home')} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl mt-4 shadow-md active:scale-95 transition-transform">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- 2. HOME PAGE --- */
function HomePage({ onNavigate }) {
  return (
    <div className="max-w-6xl mx-auto">
      <StandardHeader title="Good Morning!" subtitle="John Doe • UIU Student" showProfile />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-black text-slate-800 px-2 mt-4">How are you feeling today?</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MenuCard icon={<Stethoscope />} title="Symptom Checker" subtitle="Check your symptoms" color="text-orange-500" onClick={() => onNavigate('symptoms')} />
          <MenuCard icon={<MessageSquare />} title="AI Doctor Chat" subtitle="Chat with AI doctor" color="text-rose-500" onClick={() => onNavigate('chat')} />
          <MenuCard icon={<Brain />} title="Mental Health" subtitle="Mental health support" color="text-purple-500" onClick={() => onNavigate('mental')} />
          <MenuCard icon={<AlertTriangle />} title="Emergency Help" subtitle="Get immediate help" color="text-red-500" onClick={() => onNavigate('emergency')} />
        </div>
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 rounded-[35px] text-white shadow-lg flex items-center gap-5">
          <div className="bg-white/20 p-4 rounded-2xl shrink-0"><Heart className="w-8 h-8" /></div>
          <div>
            <h4 className="font-bold text-lg">Daily Health Tip</h4>
            <p className="text-sm opacity-90">Drink at least 8 glasses of water daily to maintain good health.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- 3. SYMPTOMS PAGE --- */
function SymptomsPage({ onNavigate, selectedSymptoms, toggleSymptom }) {
  const symptoms = [
    { id: 'diz', title: 'Dizziness', icon: <Wind />, color: 'bg-cyan-500' },
    { id: 'vom', title: 'Vomiting', icon: <Droplet />, color: 'bg-green-500' },
    { id: 'fev', title: 'Fever', icon: <Thermometer />, color: 'bg-red-500' },
    { id: 'head', title: 'Headache', icon: <Brain />, color: 'bg-purple-500' },
    { id: 'chst', title: 'Chest Pain', icon: <Heart />, color: 'bg-rose-500' },
    { id: 'stmc', title: 'Stomach Pain', icon: <Activity />, color: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <StandardHeader title="Symptom Checker" subtitle="Select your symptoms" onBack={() => onNavigate('home')} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {symptoms.map(s => (
            <SelectableCard key={s.id} {...s} selected={selectedSymptoms.includes(s.id)} onClick={() => toggleSymptom(s.id)} />
          ))}
        </div>
        <button disabled={selectedSymptoms.length === 0} className={`w-full py-5 rounded-[25px] font-bold text-lg shadow-lg transition-all ${selectedSymptoms.length > 0 ? 'bg-slate-800 text-white active:scale-95' : 'bg-slate-200 text-slate-400'}`}>
          Check Symptoms {selectedSymptoms.length > 0 && `(${selectedSymptoms.length})`}
        </button>
      </div>
    </div>
  );
}

/* --- 4. MENTAL HEALTH PAGE --- */
function MentalHealthPage({ onNavigate }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const moods = [
    { id: 'happy', label: 'Happy', emoji: '😊' },
    { id: 'neutral', label: 'Neutral', emoji: '😐' },
    { id: 'sad', label: 'Sad', emoji: '😢' },
    { id: 'stressed', label: 'Stressed', emoji: '🤯' },
    { id: 'anxious', label: 'Anxious', emoji: '😰' },
  ];

  const toggleMood = (id) => setSelectedMood(selectedMood === id ? null : id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <StandardHeader title="Mental Health" subtitle="Your mental health matters. Seeking help is a sign of strength." onBack={() => onNavigate('home')} />
      
      <div className="px-6 space-y-6">
        {/* Mood Selector (Matching Screenshot) */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-purple-500 text-lg">✨</span>
            <h3 className="font-bold text-slate-700">How are you feeling today?</h3>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {moods.map((m) => (
              <button 
                key={m.id} 
                onClick={() => toggleMood(m.id)}
                className={`flex flex-col items-center justify-center gap-3 py-10 rounded-[30px] transition-all duration-300 ${
                  selectedMood === m.id 
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-xl scale-105' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">{m.label}</span>
              </button>
            ))}
          </div>

          {selectedMood === 'stressed' && (
            <div className="mt-6 bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs text-rose-600 font-medium leading-relaxed">
                Stress is common during university. Try our Pomodoro timer to manage tasks better, or practice breathing exercises.
              </p>
            </div>
          )}
        </div>

        {/* Sections for Stress, Anxiety, Depression */}
        <div className="space-y-4">
          <h3 className="font-bold px-2 text-slate-800">Explore Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MenuCard small icon={<Brain />} title="Stress" color="text-blue-500" onClick={() => setActiveModal('stress')} />
            <MenuCard small icon={<Wind />} title="Anxiety" color="text-purple-500" onClick={() => setActiveModal('anxiety')} />
            <MenuCard small icon={<Heart />} title="Depression" color="text-indigo-500" onClick={() => setActiveModal('depression')} />
          </div>
        </div>

        {/* Relief Tools */}
        <div className="space-y-4">
          <h3 className="font-bold px-2 text-slate-800">Quick Relief Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ToolCard t="Breathing" s="2-min exercise" i={<Wind/>} c="bg-cyan-400 text-white" onClick={() => setActiveModal('breathing')} />
            <ToolCard t="Meditation" s="5-min session" i={<Music/>} c="bg-fuchsia-400 text-white" onClick={() => setActiveModal('meditation')} />
            <ToolCard t="Focus Timer" s="Pomodoro" i={<Timer/>} c="bg-orange-400 text-white" onClick={() => setActiveModal('focus')} />
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-4 pb-10">
          <h3 className="font-bold px-2 text-slate-800">Resources & Support</h3>
          <div className="bg-white p-5 rounded-[30px] flex items-center gap-4 border border-slate-100 shadow-sm cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveModal('counselor')}>
            <div className="bg-green-50 p-3 rounded-2xl text-green-500"><Calendar/></div>
            <div><p className="font-bold">Book a Counselor</p><p className="text-xs text-slate-400 font-medium">Professional support • Available slots</p></div>
          </div>
        </div>
      </div>

      {/* --- MODALS (Functional placeholders based on your images) --- */}
      
      {/* 1. Stress Modal */}
      <Modal isOpen={activeModal === 'stress'} onClose={() => setActiveModal(null)} title="Understanding Stress" icon={<Brain/>} colorClass="bg-blue-500">
        <p className="text-sm text-slate-500 leading-relaxed mb-6">Stress is your body's response to challenging situations. It's completely normal, especially during exams and deadlines.</p>
        <div className="space-y-3">
          <h4 className="font-bold text-sm mb-2">Common Symptoms</h4>
          {['Feeling overwhelmed by tasks', 'Difficulty concentrating', 'Headaches or tension'].map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className={`w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center ${i === 0 ? 'bg-blue-500' : ''}`}>
                {i === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
              </div>
              <span className="text-sm font-medium text-slate-600">{s}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* 2. Anxiety Modal */}
      <Modal isOpen={activeModal === 'anxiety'} onClose={() => setActiveModal(null)} title="Understanding Anxiety" icon={<Wind/>} colorClass="bg-purple-500">
        <p className="text-sm text-slate-500 leading-relaxed mb-6">Anxiety involves excessive worry about future events. It's your mind trying to protect you, but sometimes it goes into overdrive.</p>
        <div className="space-y-3">
          <h4 className="font-bold text-sm mb-2">Common Symptoms</h4>
          {['Constant worrying', 'Feeling restless or on edge', 'Rapid heartbeat'].map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-5 h-5 rounded-full border-2 border-purple-500"></div>
              <span className="text-sm font-medium text-slate-600">{s}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* 3. Breathing Modal */}
      <Modal isOpen={activeModal === 'breathing'} onClose={() => setActiveModal(null)} title="2-Minute Breathing" icon={<Wind/>} colorClass="bg-cyan-500">
        <div className="flex flex-col items-center justify-center py-8">
           <div className="w-40 h-40 rounded-full border-8 border-cyan-100 flex items-center justify-center bg-cyan-500 shadow-xl shadow-cyan-200 animate-pulse">
              <div className="text-center text-white">
                <p className="text-xs uppercase font-black">Breathe In</p>
                <p className="text-4xl font-black">4</p>
              </div>
           </div>
           <button className="mt-10 w-full bg-cyan-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-100">
             <Play size={18} fill="white"/> Start Exercise
           </button>
           <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-wider">Practice daily to reduce stress</p>
        </div>
      </Modal>

      {/* 4. Counselor Booking */}
      <Modal isOpen={activeModal === 'counselor'} onClose={() => setActiveModal(null)} title="Book a Counselor" icon={<Calendar/>} colorClass="bg-green-500">
        <div className="space-y-6">
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2"><Calendar size={12}/> Select Date</p>
              <div className="flex justify-between gap-2">
                 {['Mon 1', 'Tue 2', 'Wed 3', 'Thu 4', 'Fri 5'].map((d, i) => (
                   <button key={i} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold ${i === 2 ? 'bg-fuchsia-500 border-fuchsia-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                     {d.split(' ')[0]}<br/><span className="text-lg">{d.split(' ')[1]}</span>
                   </button>
                 ))}
              </div>
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2"><Clock size={12}/> Select Time</p>
              <div className="grid grid-cols-2 gap-2">
                 {['9:00 AM', '10:00 AM', '1:00 PM', '2:00 PM'].map((t, i) => (
                   <button key={i} className="py-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-100">
                     {t}
                   </button>
                 ))}
              </div>
           </div>
           <button className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-lg">Confirm Appointment</button>
        </div>
      </Modal>
    </div>
  );
}

/* --- 5. AI DOCTOR CHAT PAGE --- */
function ChatPage({ onNavigate }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI Health Assistant. How can I help you today?", sender: 'ai', time: '10:30 AM' },
    { id: 2, text: "I have a headache and feeling tired", sender: 'user', time: '10:31 AM' },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([...messages, { id: Date.now(), text: input, sender: 'user', time: now }]);
    setInput('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-[#FFF8F6]">
      <StandardHeader title="AI Health Assistant" subtitle="Online • Ready to help" onBack={() => onNavigate('home')} />

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] px-6 py-4 rounded-[30px] shadow-sm text-sm leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-orange-500 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
            }`}>
              {m.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-2 font-bold px-2">{m.time}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 bg-transparent sticky bottom-24">
        <div className="bg-white rounded-full shadow-xl border border-slate-100 flex items-center p-2 pl-6 gap-4">
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 bg-transparent outline-none text-sm text-slate-600"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="bg-orange-500 text-white p-3.5 rounded-full shadow-lg shadow-orange-200 active:scale-90 transition-transform">
            <Send size={20} fill="white"/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- 6. PROFILE PAGE --- */
function ProfilePage({ onNavigate }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <StandardHeader title="My Profile" subtitle="UIU-2023-12345 • John Doe" onBack={() => onNavigate('home')} />
      <div className="px-6 py-4">
         <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col items-center">
            <div className="bg-slate-50 p-8 rounded-full mb-6 border-4 border-white shadow-inner"><User size={64} className="text-slate-300"/></div>
            <h3 className="text-2xl font-black text-slate-800">John Doe</h3>
            <p className="text-slate-400 font-bold">john.doe@uiu.edu</p>
         </div>
      </div>
    </div>
  );
}

/* --- OTHER PAGES --- */
function EmergencyPage({ onNavigate }) { return <div className="bg-red-50 min-h-screen"><StandardHeader title="Emergency Help" subtitle="Immediate Support" onBack={() => onNavigate('home')} /><div className="p-6"><div className="bg-white p-8 rounded-[40px] shadow-xl text-center"><Phone className="text-red-600 mx-auto mb-4" size={48} /><h3 className="text-3xl font-black text-red-600 mb-2">999</h3><p className="text-slate-500 font-bold mb-6">UIU Medical Emergency Line</p><button className="w-full bg-red-600 text-white py-6 rounded-[30px] text-xl font-black">CALL NOW</button></div></div></div> }
function HospitalsPage({ onNavigate }) { return <div className="max-w-4xl mx-auto"><StandardHeader title="Nearby Hospitals" subtitle="Facilities near you" onBack={() => onNavigate('home')} /><div className="p-6"><div className="w-full h-80 bg-slate-200 rounded-[50px] mb-6 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-300"><MapPin size={48} className="opacity-20"/><p className="font-bold">Locating facilities...</p></div></div></div> }

/* --- REUSABLE UI HELPERS --- */
function MenuCard({ icon, title, subtitle, color, onClick, small }) {
  return (
    <div onClick={onClick} className={`bg-white rounded-[35px] shadow-sm border border-slate-100 flex items-center cursor-pointer hover:shadow-lg active:scale-95 transition-all group ${small ? 'p-4 gap-3' : 'p-6 gap-5'}`}>
      <div className={`p-4 rounded-[25px] bg-slate-50 ${color} group-hover:scale-110 transition-transform`}>{React.cloneElement(icon, { size: small ? 24 : 30 })}</div>
      <div><h3 className={`font-bold leading-tight ${small ? 'text-sm' : 'text-xl'}`}>{title}</h3>{subtitle && <p className="text-slate-400 text-sm font-medium">{subtitle}</p>}</div>
    </div>
  );
}

function ToolCard({ t, s, i, c, onClick }) {
  return (
    <div onClick={onClick} className={`${c} p-6 rounded-[35px] shadow-lg flex flex-col items-center justify-center text-center gap-3 cursor-pointer active:scale-95 transition-transform`}>
       <div className="bg-white/20 p-3 rounded-2xl">{React.cloneElement(i, { size: 28 })}</div>
       <div><p className="font-bold">{t}</p><p className="text-[10px] opacity-80 font-bold">{s}</p></div>
    </div>
  );
}

function SelectableCard({ icon, title, color, selected, onClick }) {
  return (
    <div onClick={onClick} className={`p-6 rounded-[35px] flex items-center justify-between border-2 transition-all cursor-pointer ${selected ? 'border-orange-500 bg-white shadow-xl scale-[1.02]' : 'border-transparent bg-white shadow-sm'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl text-white ${color} shadow-lg shadow-current/20`}>{React.cloneElement(icon, { size: 28 })}</div>
        <h4 className="font-black text-slate-800 text-lg">{title}</h4>
      </div>
      <div className={`w-6 h-6 rounded-full border-[6px] transition-colors ${selected ? 'border-orange-500' : 'border-slate-100'}`}></div>
    </div>
  );
}

function BottomNav({ currentPage, onNavigate }) {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'symptoms', icon: Stethoscope, label: 'Symptoms' },
    { id: 'chat', icon: MessageSquare, label: 'AI Doctor' },
    { id: 'mental', icon: Brain, label: 'Mental' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];
  return (
    <div className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl border border-white/50 px-8 py-5 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[40px] z-[90] max-w-4xl mx-auto">
      {items.map((item) => (
        <button key={item.id} onClick={() => onNavigate(item.id)} className="flex flex-col items-center gap-1 group">
          <div className={`p-3 rounded-2xl transition-all duration-300 ${currentPage === item.id ? 'bg-orange-500 text-white shadow-orange-200 shadow-xl scale-125 -translate-y-3' : 'text-slate-400'}`}>
            <item.icon size={22} />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-tighter transition-all ${currentPage === item.id ? 'text-orange-600 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}