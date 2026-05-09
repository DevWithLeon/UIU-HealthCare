import React, { useState, useRef, useEffect } from 'react';

import {

  Heart, User, Lock, Home, Stethoscope, MessageSquare, Brain,

  Bell, ArrowLeft, Wind, Droplet, Thermometer, AlertTriangle,

  Phone, MapPin, FileText, Activity, Calendar, Clock, Settings, LogOut, ChevronRight, Music, Timer, Send, Bot

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

      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-b-[50px] text-white shadow-md">

        <div className="flex justify-between items-center mb-8">

          <div className="flex items-center gap-4">

            <div className="bg-white/20 p-3 rounded-2xl"><User className="w-7 h-7" /></div>

            <div>

              <h2 className="font-bold text-xl leading-tight">Good Morning!</h2>

              <p className="text-sm opacity-80">John Doe</p>

            </div>

          </div>

          <button className="bg-white/20 p-3 rounded-full"><Bell className="w-6 h-6" /></button>

        </div>

        <h1 className="text-3xl font-bold mb-2">How are you feeling today?</h1>

        <p className="opacity-90">Check your health status and find support</p>

      </div>



      <div className="p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <MenuCard icon={<Stethoscope />} title="Symptom Checker" subtitle="Check your symptoms" color="text-orange-500" onClick={() => onNavigate('symptoms')} />

          <MenuCard icon={<MessageSquare />} title="AI Doctor Chat" subtitle="Chat with AI doctor" color="text-rose-500" onClick={() => onNavigate('chat')} />

          <MenuCard icon={<Brain />} title="Mental Health" subtitle="Mental health support" color="text-purple-500" onClick={() => onNavigate('mental')} />

          <MenuCard icon={<AlertTriangle />} title="Emergency Help" subtitle="Get immediate help" color="text-red-500" onClick={() => onNavigate('emergency')} />

          <MenuCard icon={<MapPin />} title="Nearby Hospitals" subtitle="Find nearby hospitals" color="text-amber-500" onClick={() => onNavigate('hospitals')} />

        </div>



        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 rounded-[35px] text-white shadow-lg flex items-center gap-5">

          <div className="bg-white/20 p-4 rounded-2xl shrink-0"><Heart className="w-8 h-8" /></div>

          <div>

            <h4 className="font-bold text-lg">Daily Health Tip</h4>

            <p className="text-sm opacity-90">Drink at least 8 glasses of water daily to stay hydrated and maintain good health.</p>

          </div>

        </div>



        <div className="grid grid-cols-3 gap-4">

          <StatCard label="Checkups" value="12" color="text-orange-500" />

          <StatCard label="Reports" value="8" color="text-red-500" />

          <StatCard label="Sessions" value="5" color="text-purple-500" />

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

      <Header title="Symptom Checker" subtitle="Select your symptoms" onBack={() => onNavigate('home')} />

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

  const [hoveredDay, setHoveredDay] = useState(null);

  const moodData = [

    { day: 'Tue', value: 80, mood: 'Happy' },

    { day: 'Wed', value: 40, mood: 'Neutral' },

    { day: 'Thu', value: 60, mood: 'Okay' },

    { day: 'Fri', value: 40, mood: 'Low' },

    { day: 'Sat', value: 80, mood: 'Great' },

    { day: 'Sun', value: 60, mood: 'Okay' },

    { day: 'Mon', value: 40, mood: 'Difficult' }

  ];



  return (

    <div className="max-w-6xl mx-auto space-y-6">

      <Header title="Mental Health" subtitle="Track and improve your wellbeing" onBack={() => onNavigate('home')} />

     

      <div className="px-6 space-y-6">

        <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100">

          <div className="flex justify-between items-start mb-4">

            <div>

              <h3 className="font-bold text-lg">7-Day Mood Trend</h3>

              <p className="text-xs text-slate-400">Track your emotional wellbeing</p>

            </div>

            <div className="text-right">

              <p className="text-orange-500 text-xs font-bold flex items-center gap-1 justify-end"><Activity size={12}/> Declining</p>

              <p className="text-[10px] text-slate-400">Avg: Okay</p>

            </div>

          </div>



          <div className="relative h-48 w-full mt-4 flex items-end px-4">

            <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">

              <path

                d="M 50 80 Q 150 150 250 100 T 450 120 T 650 80"

                fill="none"

                stroke="#d946ef"

                strokeWidth="4"

                strokeLinecap="round"

              />

              {moodData.map((data, i) => {

                const x = 50 + i * 100;

                const y = 200 - (data.value * 1.5);

                return (

                  <g key={i} onMouseEnter={() => setHoveredDay(i)} onMouseLeave={() => setHoveredDay(null)} className="cursor-pointer">

                    <circle

                      cx={x}

                      cy={y}

                      r={hoveredDay === i ? "10" : "6"}

                      fill="#d946ef"

                      className="transition-all duration-200"

                    />

                    {hoveredDay === i && (

                      <foreignObject x={x - 40} y={y - 65} width="80" height="50">

                        <div className="bg-slate-800 text-white p-2 rounded-xl text-[10px] text-center shadow-xl font-bold animate-in fade-in zoom-in duration-200">

                          {data.day}<br/>{data.mood}

                        </div>

                      </foreignObject>

                    )}

                  </g>

                );

              })}

            </svg>

          </div>

          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-4 px-10 uppercase">

            {moodData.map(d => <span key={d.day}>{d.day}</span>)}

          </div>

        </div>



        <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100">

          <h3 className="font-bold mb-4">Current Stress Level</h3>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

            <div className="h-full bg-green-400 w-[40%] rounded-full shadow-inner"></div>

          </div>

          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">

            <span>Low</span><span>Moderate</span><span>High</span>

          </div>

        </div>



        <div className="space-y-4">

          <h3 className="font-bold px-2">What's on your mind?</h3>

          {[

            { t: 'Stress', s: 'Academic pressure & deadlines', i: <Brain className="text-blue-500"/>, b: 'bg-blue-50' },

            { t: 'Anxiety', s: 'Worry & nervousness', i: <AlertTriangle className="text-fuchsia-500"/>, b: 'bg-fuchsia-50' },

            { t: 'Depression', s: 'Low mood & motivation', i: <Wind className="text-indigo-500"/>, b: 'bg-indigo-50' },

          ].map((item, idx) => (

            <div key={idx} className="bg-white p-5 rounded-[30px] flex items-center gap-4 border border-slate-100 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">

              <div className={`${item.b} p-3 rounded-2xl`}>{item.i}</div>

              <div><p className="font-bold">{item.t}</p><p className="text-xs text-slate-400">{item.s}</p></div>

            </div>

          ))}

        </div>



        <div className="space-y-4">

          <h3 className="font-bold px-2">Quick Relief Tools</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <ToolCard t="Breathing" s="2-min exercise" i={<Wind/>} c="bg-cyan-400 text-white" />

            <ToolCard t="Meditation" s="5-min session" i={<Music/>} c="bg-fuchsia-400 text-white" />

            <ToolCard t="Focus Timer" s="Pomodoro" i={<Timer/>} c="bg-orange-400 text-white" />

          </div>

        </div>



        <div className="bg-gradient-to-r from-fuchsia-500 to-rose-500 p-8 rounded-[40px] text-white shadow-lg">

           <div className="flex items-center gap-4 mb-4">

              <div className="bg-white/20 p-3 rounded-2xl"><MessageSquare size={30}/></div>

              <div>

                <h4 className="font-bold text-xl leading-tight">Talk to AI Support</h4>

                <p className="text-xs opacity-80">Share your feelings in a safe, non-judgmental space</p>

              </div>

           </div>

           <div className="flex flex-wrap gap-2">

              {['"I feel overwhelmed"', '"I can\'t focus"', '"I feel lonely"'].map((q, i) => (

                <span key={i} className="bg-white/20 px-4 py-2 rounded-full text-[10px] font-medium border border-white/10 cursor-pointer hover:bg-white/30">{q}</span>

              ))}

           </div>

        </div>



        <div className="space-y-4 pb-10">

          <h3 className="font-bold px-2">Resources & Support</h3>

          {[

            { t: 'Book a Counselor', s: 'Professional support • Available slots', i: <Calendar/>, c: 'text-green-500', b: 'bg-green-50' },

            { t: '24/7 Crisis Helpline', s: '1-800-273-8255', i: <Phone/>, c: 'text-rose-500', b: 'bg-rose-50' },

            { t: 'Self-Help Resources', s: 'Articles, guides, coping strategies', i: <FileText/>, c: 'text-blue-500', b: 'bg-blue-50' },

          ].map((r, i) => (

            <div key={i} className="bg-white p-5 rounded-[30px] flex items-center gap-4 border border-slate-100 shadow-sm cursor-pointer">

              <div className={`${r.b} ${r.c} p-3 rounded-2xl`}>{r.i}</div>

              <div><p className="font-bold">{r.t}</p><p className="text-xs text-slate-400 font-medium">{r.s}</p></div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}



/* --- 5. AI DOCTOR CHAT PAGE --- */

function ChatPage({ onNavigate }) {

  const [messages, setMessages] = useState([

    { id: 1, text: "Hello! I'm your AI Health Assistant. How can I help you today?", sender: 'ai', time: '10:30 AM' },

    { id: 2, text: "I have a headache and feeling tired", sender: 'user', time: '10:31 AM' },

    { id: 3, text: "I understand you're experiencing a headache and fatigue. Can you tell me how long you've been feeling this way? Also, have you experienced any other symptoms like fever or dizziness?", sender: 'ai', time: '10:31 AM' }

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

      {/* Header matching screenshot */}

      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-b-[40px] flex items-center gap-4 text-white shadow-lg sticky top-0 z-10">

        <button onClick={() => onNavigate('home')} className="bg-white/20 p-2 rounded-full"><ArrowLeft size={20}/></button>

        <div className="bg-white/20 p-2.5 rounded-2xl"><Bot size={24}/></div>

        <div>

          <h2 className="font-bold text-lg leading-tight">AI Health Assistant</h2>

          <p className="text-[10px] opacity-80 uppercase font-black tracking-widest">Online</p>

        </div>

      </div>



      {/* Chat Area */}

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



      {/* Input Area matching screenshot */}

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

          <button

            onClick={sendMessage}

            className="bg-orange-500 text-white p-3.5 rounded-full shadow-lg shadow-orange-200 active:scale-90 transition-transform"

          >

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

      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-b-[50px] text-white shadow-xl">

        <button onClick={() => onNavigate('home')} className="bg-white/20 p-2 rounded-full mb-8"><ArrowLeft size={20} /></button>

        <div className="flex items-center gap-6">

          <div className="bg-white/20 p-6 rounded-[35px] shadow-inner shrink-0"><User size={48} /></div>

          <div>

            <h2 className="text-3xl font-black tracking-tight">John Doe</h2>

            <p className="text-sm opacity-90 font-bold mt-1">Student ID: UIU-2023-12345</p>

            <p className="text-sm opacity-70">john.doe@uiu.edu</p>

          </div>

        </div>

      </div>



      <div className="px-6 -mt-12">

        <div className="grid grid-cols-3 gap-4 mb-8">

           <StatCard label="Checkups" value="12" color="text-orange-500" profile />

           <StatCard label="Reports" value="8" color="text-red-500" profile />

           <StatCard label="Sessions" value="5" color="text-purple-500" profile />

        </div>



        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-6 mb-6">

           <div className="flex items-center gap-3 mb-6">

              <div className="bg-orange-50 p-2 rounded-xl"><FileText className="text-orange-500" size={24}/></div>

              <h3 className="font-black text-xl tracking-tight">Health History</h3>

           </div>

           <div className="space-y-3">

              <HistoryItem t="Common Cold" d="March 10, 2026" s="Recovered" />

              <HistoryItem t="Headache & Fatigue" d="February 28, 2026" s="Recovered" />

              <HistoryItem t="Stomach Pain" d="January 15, 2026" s="Recovered" />

           </div>

        </div>



        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-6 mb-6">

           <div className="flex items-center gap-3 mb-6">

              <div className="bg-rose-50 p-2 rounded-xl"><Calendar className="text-rose-500" size={24}/></div>

              <h3 className="font-black text-xl tracking-tight">Appointments</h3>

           </div>

           <div className="space-y-4">

              <div className="bg-slate-50 p-5 rounded-[30px] border border-slate-100">

                  <div className="flex justify-between items-start mb-3">

                    <p className="font-bold text-lg">General Checkup</p>

                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black">Upcoming</span>

                  </div>

                  <p className="text-xs text-slate-500 mb-4 font-bold tracking-wide">Dr. Sarah Johnson</p>

                  <div className="flex gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">

                     <span className="flex items-center gap-1.5"><Calendar size={12}/> March 20, 2026</span>

                     <span className="flex items-center gap-1.5"><Clock size={12}/> 10:00 AM</span>

                  </div>

              </div>



              <div className="bg-slate-50 p-5 rounded-[30px] border border-slate-100">

                  <div className="flex justify-between items-start mb-3">

                    <p className="font-bold text-lg">Mental Health Session</p>

                    <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">Completed</span>

                  </div>

                  <p className="text-xs text-slate-500 mb-4 font-bold tracking-wide">Dr. Michael Chen</p>

                  <div className="flex gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">

                     <span className="flex items-center gap-1.5"><Calendar size={12}/> March 5, 2026</span>

                     <span className="flex items-center gap-1.5"><Clock size={12}/> 2:30 PM</span>

                  </div>

              </div>

           </div>

        </div>



        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-4 space-y-2 mb-10">

            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 rounded-[25px] transition-colors group">

              <div className="flex items-center gap-4">

                <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-white"><Settings size={20}/></div>

                <p className="font-bold">Settings</p>

              </div>

              <ChevronRight className="text-slate-300" size={20}/>

            </button>

            <button onClick={() => onNavigate('login')} className="w-full p-4 flex items-center justify-between hover:bg-rose-50 rounded-[25px] transition-colors group">

              <div className="flex items-center gap-4">

                <div className="bg-rose-50 p-3 rounded-2xl group-hover:bg-white"><LogOut size={20} className="text-rose-500"/></div>

                <p className="font-bold text-rose-500">Logout</p>

              </div>

            </button>

        </div>

      </div>

    </div>

  );

}



/* --- OTHER PAGES --- */

function EmergencyPage({ onNavigate }) { return <div className="bg-red-50 min-h-screen"><Header title="Emergency Help" subtitle="Immediate Support" onBack={() => onNavigate('home')} /><div className="p-6 space-y-6"><div className="bg-white p-8 rounded-[40px] shadow-xl text-center"><Phone className="text-red-600 mx-auto mb-4" size={48} /><h3 className="text-3xl font-black text-red-600 mb-2">999</h3><p className="text-slate-500 font-bold mb-6">UIU Medical Emergency Line</p><button className="w-full bg-red-600 text-white py-6 rounded-[30px] text-xl font-black shadow-lg shadow-red-200">CALL NOW</button></div></div></div> }

function HospitalsPage({ onNavigate }) { return <div className="max-w-4xl mx-auto"><Header title="Nearby Hospitals" subtitle="Facilities near you" onBack={() => onNavigate('home')} /><div className="p-6"><div className="w-full h-80 bg-slate-200 rounded-[50px] mb-6 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-300"><MapPin size={48} className="opacity-20"/><p className="font-bold">Locating facilities...</p></div></div></div> }



/* --- REUSABLE UI HELPERS --- */

function Header({ title, subtitle, onBack }) {

  return (

    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-b-[50px] text-white shadow-md flex items-center gap-5">

      <button onClick={onBack} className="bg-white/20 p-2.5 rounded-full hover:bg-white/30 transition-colors"><ArrowLeft size={22} /></button>

      <div><h2 className="font-bold text-2xl tracking-tight">{title}</h2><p className="text-xs opacity-80 font-bold">{subtitle}</p></div>

    </div>

  );

}



function MenuCard({ icon, title, subtitle, color, onClick }) {

  return (

    <div onClick={onClick} className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 flex items-center gap-5 cursor-pointer hover:shadow-lg active:scale-95 transition-all group">

      <div className={`p-4 rounded-[25px] bg-slate-50 ${color} group-hover:scale-110 transition-transform`}>{React.cloneElement(icon, { size: 30 })}</div>

      <div><h3 className="font-bold text-xl leading-tight">{title}</h3><p className="text-slate-400 text-sm font-medium">{subtitle}</p></div>

    </div>

  );

}



function StatCard({ label, value, color, profile }) {

  return (

    <div className={`bg-white p-6 rounded-[35px] shadow-sm text-center border border-slate-100 flex-1 ${profile ? 'shadow-lg' : ''}`}>

      <p className={`text-2xl font-black ${color}`}>{value}</p>

      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>

    </div>

  );

}



function ToolCard({ t, s, i, c }) {

  return (

    <div className={`${c} p-6 rounded-[35px] shadow-lg flex flex-col items-center justify-center text-center gap-3 cursor-pointer active:scale-95 transition-transform`}>

       <div className="bg-white/20 p-3 rounded-2xl">{React.cloneElement(i, { size: 28 })}</div>

       <div><p className="font-bold">{t}</p><p className="text-[10px] opacity-80 font-bold">{s}</p></div>

    </div>

  );

}



function HistoryItem({ t, d, s }) {

  return (

    <div className="bg-slate-50 p-4 flex items-center justify-between rounded-[25px] border border-slate-100">

       <div className="flex items-center gap-3">

          <div className="w-2 h-2 rounded-full bg-orange-500"></div>

          <div><p className="font-bold text-sm leading-none mb-1">{t}</p><p className="text-[10px] text-slate-400 font-medium">{d}</p></div>

       </div>

       <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black tracking-tighter">{s}</span>

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

    <div className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl border border-white/50 px-8 py-5 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[40px] z-50 max-w-4xl mx-auto">

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
