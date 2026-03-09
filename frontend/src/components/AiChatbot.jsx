import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, X, Bot, Landmark, Users, Package, Sparkles, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const QUICK_ACTIONS = [
    { label: "Fee Stats", icon: Landmark, query: "Show me the fee collection statistics." },
    { label: "Students", icon: Users, query: "How many total students are in the school?" },
    { label: "Inventory", icon: Package, query: "What is the current status of the inventory?" },
    { label: "Exams", icon: GraduationCap, query: "What is the status of upcoming exams?" },
    { label: "Tips", icon: Sparkles, query: "How do I use this system? Give me some tips." },
];

export default function AiChatbot() {
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! 👋\n\nI am your **SMS Assistant**. Ask me about students, fees, attendance, or anything else.' }
    ]);
    const [loading, setLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const schoolId = currentUser?.school?._id || currentUser?._id;

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
    useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 350); }, [isOpen]);

    const send = async (text) => {
        const msg = (text || query).trim();
        if (!msg || loading) return;

        setQuery('');
        setMessages(p => [...p, { role: 'user', content: msg }]);
        setLoading(true);

        try {
            // Check if this is a confirmation response
            const isConfirm = pendingAction && ['haan', 'yes', 'ha', 'confirm', 'kar do', 'ok', 'okay'].some(w => msg.toLowerCase().includes(w));
            const isCancel  = pendingAction && ['nahi', 'no', 'cancel', 'band karo', 'mat karo'].some(w => msg.toLowerCase().includes(w));

            if (isCancel && pendingAction) {
                setPendingAction(null);
                setMessages(p => [...p, { role: 'assistant', content: '❌ Action cancelled.' }]);
                setLoading(false);
                return;
            }

            const payload = {
                query: msg,
                schoolId,
                ...(isConfirm && pendingAction ? { confirmedAction: pendingAction } : {})
            };

            if (isConfirm && pendingAction) setPendingAction(null);

            const res = await axios.post(`${API_URL}/AiChat/Groq`, payload);

            if (res.data.requiresConfirmation) {
                setPendingAction(res.data.pendingAction);
                setMessages(p => [...p, { 
                    role: 'assistant', 
                    content: res.data.response,
                    isConfirmation: true 
                }]);
            } else {
                setMessages(p => [...p, { role: 'assistant', content: res.data.success ? res.data.response : 'Something went wrong.' }]);
            }
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(p => [...p, { role: 'assistant', content: 'Server error. 🛑' }]);
        } finally { setLoading(false); }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
                .sms * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
                .sms-scroll { overflow-y: auto; scrollbar-width: thin; scrollbar-color: #e5e7eb transparent; }
                .sms-scroll::-webkit-scrollbar { width: 3px; }
                .sms-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
                .sms-md p { margin: 0 0 6px; line-height: 1.65; }
                .sms-md p:last-child { margin: 0; }
                .sms-md ul, .sms-md ol { margin: 4px 0 4px 18px; }
                .sms-md li { margin: 2px 0; }
                .sms-md strong { font-weight: 600; }
                .sms-md code { background: #f3f4f6; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
                .sms-md table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin-top: 6px; }
                .sms-md th { background: #f9fafb; padding: 6px 10px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; }
                .sms-md td { padding: 5px 10px; border-bottom: 1px solid #f3f4f6; color: #4b5563; }
                @keyframes smsPulse { 0%,100%{opacity:.35;transform:scale(.85)} 50%{opacity:1;transform:scale(1)} }
                .sms-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:#9ca3af; animation:smsPulse 1.3s ease-in-out infinite; }
                .sms-dot:nth-child(2){animation-delay:.22s} .sms-dot:nth-child(3){animation-delay:.44s}
                .sms-chip { cursor:pointer; border:1px solid #e5e7eb; background:#fff; color:#6b7280; font-size:11.5px; padding:5px 11px; border-radius:99px; white-space:nowrap; display:flex; align-items:center; gap:5px; transition:all .15s; font-weight:500; font-family:'Inter',sans-serif; }
                .sms-chip:hover { border-color:#111; color:#111; }
                .sms-fab { width:52px; height:52px; border-radius:15px; background:#111; border:none; box-shadow:0 2px 8px rgba(0,0,0,.18),0 8px 24px rgba(0,0,0,.12); display:flex; align-items:center; justify-content:center; cursor:pointer; }
                .sms-close { width:30px; height:30px; border-radius:8px; border:1px solid #f3f4f6; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#9ca3af; transition:all .15s; }
                .sms-close:hover { background:#fef2f2; color:#ef4444; border-color:#fca5a5; }
                .sms-send { width:34px; height:34px; border-radius:9px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; flex-shrink:0; font-family:'Inter',sans-serif; }
                .sms-send:enabled { background:#111; color:#fff; }
                .sms-send:enabled:hover { background:#374151; }
                .sms-send:disabled { background:#f3f4f6; color:#d1d5db; cursor:not-allowed; }
                .sms-input-wrap:focus-within { border-color:#111 !important; }
            `}</style>

            <div className="sms" style={{ position:'fixed', bottom:24, right:24, zIndex:9999 }}>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity:0, y:14, scale:.97 }}
                            animate={{ opacity:1, y:0, scale:1 }}
                            exit={{ opacity:0, y:14, scale:.97 }}
                            transition={{ duration:.18, ease:[.25,.46,.45,.94] }}
                            style={{
                                position:'absolute', bottom:68, right:0,
                                width:390, maxWidth:'calc(100vw - 32px)',
                                height:620, maxHeight:'85vh',
                                background:'#ffffff',
                                borderRadius:20,
                                border:'1px solid #e5e7eb',
                                boxShadow:'0 4px 6px -1px rgba(0,0,0,.06), 0 16px 48px -8px rgba(0,0,0,.14)',
                                display:'flex', flexDirection:'column',
                                overflow:'hidden',
                            }}
                        >
                            {/* Header */}
                            <div style={{ padding:'14px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                    <div style={{ position:'relative' }}>
                                        <div style={{ width:36, height:36, borderRadius:10, background:'#111', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                            <Bot size={17} color="white" />
                                        </div>
                                        <span style={{ position:'absolute', bottom:-1, right:-1, width:9, height:9, borderRadius:'50%', background:'#22c55e', border:'2px solid white' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize:13.5, fontWeight:600, color:'#111', letterSpacing:'-.2px' }}>SMS Assistant</div>
                                        <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>Online · Ready to help</div>
                                    </div>
                                </div>
                                <button className="sms-close" onClick={() => setIsOpen(false)}>
                                    <X size={13} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="sms-scroll" style={{ flex:1, padding:'14px 14px 6px', display:'flex', flexDirection:'column', gap:10 }}>
                                {messages.map((m, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity:0, y:5 }}
                                        animate={{ opacity:1, y:0 }}
                                        transition={{ duration:.16 }}
                                        style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}
                                    >
                                        <div style={{
                                            maxWidth:'78%',
                                            padding:'9px 13px',
                                            borderRadius: m.role==='user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                                            fontSize:13.5,
                                            lineHeight:1.6,
                                            ...(m.role==='user' ? {
                                                background:'#111',
                                                color:'#f9fafb',
                                            } : {
                                                background:'#f9fafb',
                                                color:'#1f2937',
                                                border:'1px solid #f3f4f6',
                                            })
                                        }}>
                                            <div className="sms-md">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                            </div>

                                            {/* Agentic Confirmation Buttons */}
                                            {m.isConfirmation && pendingAction && i === messages.length - 1 && (
                                                <div style={{ display:'flex', gap:8, marginTop:12, paddingBottom:4 }}>
                                                    <button
                                                        onClick={() => send('yes')}
                                                        style={{ 
                                                            padding:'6px 14px', borderRadius:8, background:'#dc2626', color:'white', 
                                                            border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
                                                            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                                                        }}
                                                    >
                                                        Confirm Active
                                                    </button>
                                                    <button
                                                        onClick={() => send('no')}
                                                        style={{ 
                                                            padding:'6px 14px', borderRadius:8, background:'#fff', color:'#374151', 
                                                            border:'1px solid #e5e7eb', cursor:'pointer', fontSize:12, fontWeight:600 
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {loading && (
                                    <div style={{ display:'flex' }}>
                                        <div style={{ background:'#f9fafb', border:'1px solid #f3f4f6', padding:'11px 14px', borderRadius:'14px 14px 14px 3px', display:'flex', gap:4, alignItems:'center' }}>
                                            <span className="sms-dot"/><span className="sms-dot"/><span className="sms-dot"/>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Quick chips */}
                            <div style={{ padding:'8px 12px', display:'flex', gap:6, overflowX:'auto', flexShrink:0, scrollbarWidth:'none' }}>
                                {QUICK_ACTIONS.map((a, i) => (
                                    <button key={i} className="sms-chip" onClick={() => send(a.query)}>
                                        <a.icon size={11}/>{a.label}
                                    </button>
                                ))}
                            </div>

                            {/* Divider */}
                            <div style={{ height:1, background:'#f3f4f6', margin:'0 14px', flexShrink:0 }} />

                            {/* Input */}
                            <div style={{ padding:'10px 12px 14px', flexShrink:0 }}>
                                <div className="sms-input-wrap" style={{ display:'flex', alignItems:'center', gap:8, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:11, padding:'5px 6px 5px 13px', transition:'border-color .15s' }}>
                                    <input
                                        ref={inputRef}
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), send())}
                                        disabled={loading}
                                        placeholder="Ask anything..."
                                        style={{ flex:1, border:'none', background:'transparent', outline:'none', fontSize:13.5, color:'#111', fontFamily:"'Inter',sans-serif" }}
                                    />
                                    <button className="sms-send" onClick={() => send()} disabled={loading || !query.trim()}>
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* FAB */}
                <motion.button
                    className="sms-fab"
                    whileHover={{ scale:1.05 }}
                    whileTap={{ scale:.95 }}
                    onClick={() => setIsOpen(p => !p)}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div key="x" initial={{rotate:-80,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:80,opacity:0}} transition={{duration:.14}}>
                                <X size={20} color="white" />
                            </motion.div>
                        ) : (
                            <motion.div key="bot" initial={{rotate:80,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-80,opacity:0}} transition={{duration:.14}} style={{position:'relative'}}>
                                <Bot size={21} color="white" />
                                <span style={{ position:'absolute', top:-3, right:-3, width:8, height:8, borderRadius:'50%', background:'#22c55e', border:'2px solid #111' }} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    );
}