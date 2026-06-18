import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';

export default function ChatAI({ profile, measurements, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Ciao ${profile.nome}! 👋 Sono il tuo assistente AI. Chiedimi qualcosa su dieta, allenamento o motivazione!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { messages: [...messages, userMsg].filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0), profile, measurements },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Errore di connessione. Riprova tra poco.' }]);
    }
    setLoading(false);
  };

  return createPortal(
    <div className="overlay" style={{ zIndex: 450, alignItems: 'flex-end' }} onClick={onClose}>
      <div className="guide-modal" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        <div className="modal-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="modal-title" style={{ marginBottom: 0 }}>ASSISTENTE AI</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Conosce i tuoi dati · risponde in italiano</div>
          </div>
          <button className="guide-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12, paddingRight: 4 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '82%',
                padding: '10px 13px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user'
                  ? 'linear-gradient(135deg,#00FF41,#00cc33)'
                  : 'rgba(255,255,255,0.07)',
                color: m.role === 'user' ? '#000' : '#fff',
                fontSize: '0.82rem',
                lineHeight: 1.55,
                fontWeight: m.role === 'user' ? 600 : 400,
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 5, padding: '10px 13px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(0,255,65,0.6)', animation: `bounce 1s ${i*0.2}s infinite` }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            style={{
              flex: 1,
              minWidth: 0,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: '0.88rem',
              color: '#fff',
              outline: 'none',
            }}
            placeholder="Scrivi un messaggio..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              flexShrink: 0,
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: input.trim() && !loading ? '#00FF41' : 'rgba(0,255,65,0.2)',
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
