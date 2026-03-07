import { useState, useEffect, useRef } from 'react';
import { ChatInput } from './ChatInput';
import { Message, Bubble, LoadingDots } from './Message';
import { useVoice } from '../context/VoiceContext';
import { api } from '../services/api';

function EligibilityModal({ scheme, onClose }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const questions = scheme?.eligibilityParsed?.questions || [];

  const handleAnswer = (answer) => {
    const q = questions[currentQuestionIndex];
    const newAnswers = { ...answers, [q.title]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      checkEligibility(newAnswers);
    }
  };

  const checkEligibility = (finalAnswers) => {
    const ep = scheme.eligibilityParsed || {};
    let eligible = true;
    let reasons = [];

    for (const [question, answer] of Object.entries(finalAnswers)) {
      const q = questions.find(x => x.title === question);
      if (q?.qualifyingAnswer === 'yes' && answer === 'no') {
        eligible = false;
        reasons.push(question);
      }
    }

    if (ep.maxAge) {
      const userAge = parseInt(localStorage.getItem('userAge') || '0');
      if (userAge && userAge > ep.maxAge) {
        eligible = false;
        reasons.push(`Age must be ${ep.maxAge} or less`);
      }
    }

    if (ep.minAge && ep.minAge > 0) {
      const userAge = parseInt(localStorage.getItem('userAge') || '0');
      if (userAge && userAge < ep.minAge) {
        eligible = false;
        reasons.push(`Age must be ${ep.minAge} or more`);
      }
    }

    if (ep.caste?.length) {
      const userCaste = localStorage.getItem('userCaste')?.toLowerCase();
      if (userCaste && !ep.caste.some(c => c.toLowerCase() === userCaste)) {
        const casteRank = { general: 2, obc: 3, sc: 4, st: 4 };
        const userRank = casteRank[userCaste] || 0;
        const allowedRank = Math.min(...ep.caste.map(c => casteRank[c.toLowerCase()] || 5));
        if (userRank > allowedRank) {
          eligible = false;
          reasons.push('Caste not eligible');
        }
      }
    }

    if (ep.isBPL && localStorage.getItem('userBPL') !== 'true') {
      eligible = false;
      reasons.push('Must be BPL card holder');
    }

    if (ep.gender && ep.gender !== 'all') {
      const userGender = localStorage.getItem('userGender')?.toLowerCase();
      if (userGender && userGender !== ep.gender) {
        eligible = false;
        reasons.push(`Only ${ep.gender} can apply`);
      }
    }

    setResult({
      eligible,
      verdict: eligible 
        ? '✅ Badhai! Aap is scheme ke liye eligible lag rahe hain!'
        : `Sorry, aap eligible nahi ho: ${reasons.join(', ')}`
    });
  };

  if (!questions.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="rounded-2xl p-6 w-full max-w-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Eligibility Check
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Is scheme ke liye koi eligibility questions available nahi hain.
          </p>
          <button onClick={onClose} className="mt-4 w-full py-2 rounded-lg font-semibold" style={{ backgroundColor: '#10a37f', color: '#fff' }}>
            Band Karein
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="rounded-2xl p-6 w-full max-w-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
        {!result ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Eligibility Check</h3>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{currentQuestionIndex + 1}/{questions.length}</span>
            </div>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{questions[currentQuestionIndex]?.title}</p>
            <div className="flex gap-3">
              <button onClick={() => handleAnswer('yes')} className="flex-1 py-3 rounded-lg font-medium" style={{ backgroundColor: '#10a37f', color: '#fff' }}>Haan</button>
              <button onClick={() => handleAnswer('no')} className="flex-1 py-3 rounded-lg font-medium" style={{ backgroundColor: '#374151', color: '#fff' }}>Nahi</button>
            </div>
            <button onClick={onClose} className="mt-4 w-full py-2 text-sm" style={{ color: 'var(--text-muted)' }}>Cancel Karein</button>
          </>
        ) : (
          <>
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: result.eligible ? '#10a37f20' : '#37415120', color: result.eligible ? '#10a37f' : 'var(--text-primary)' }}>
              {result.verdict}
            </div>
            <button onClick={onClose} className="w-full py-3 rounded-lg font-medium" style={{ backgroundColor: '#10a37f', color: '#fff' }}>Theek Hai</button>
          </>
        )}
      </div>
    </div>
  );
}

export function SchemeDetail({ scheme, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [firstMessage, setFirstMessage] = useState(true);
  const chatEndRef = useRef(null);

  const questions = scheme?.eligibilityParsed?.questions || [];

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addMessage = (type, content) => setMessages(prev => [...prev, { type, content }]);

  const handleSend = async (clearHistory = false) => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    addMessage('user', text);
    setInput('');
    setLoading(true);
    try {
      const history = messages.filter(m => m.type === 'user' || m.type === 'bot').map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }));
      const response = await api.schemeChat(scheme, text, history, clearHistory || firstMessage);
      setFirstMessage(false);
      if (response.data?.reply) addMessage('bot', response.data.reply);
    } catch (err) { addMessage('bot', `Error: ${err.message}`); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-20 px-4 h-[60px] flex items-center gap-3 border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <button onClick={onBack} className="p-2 rounded-lg" style={{ color: 'var(--text-primary)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-base font-semibold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>Scheme Details</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{scheme.name}</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ backgroundColor: '#10a37f20', color: '#10a37f' }}>{scheme.state}</span>
            {scheme.category && <span className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ backgroundColor: '#37415120', color: 'var(--text-secondary)' }}>{scheme.category}</span>}
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{scheme.description}</p>
          {scheme.benefits && <div className="mb-4"><h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Benefits</h3><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{scheme.benefits}</p></div>}
          {scheme.howToApply && <div className="mb-4"><h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Kaise Apply Karein</h3><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{scheme.howToApply}</p></div>}
          {scheme.source && <a href={scheme.source} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: '#10a37f' }}>Official Website Dekhein →</a>}
        </div>

        {questions.length > 0 && (
          <button onClick={() => setShowEligibilityModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium mb-4" style={{ backgroundColor: '#10a37f', color: '#fff' }}>✓ Eligibility Check Karein</button>
        )}

        <div className="flex flex-col gap-3 mb-4">
          {messages.map((msg, i) => (<Message key={i} type={msg.type}><Bubble type={msg.type}>{msg.content}</Bubble></Message>))}
          {loading && <Message type="bot"><LoadingDots /></Message>}
          <div ref={chatEndRef} />
        </div>
      </div>

      <ChatInput value={input} onChange={setInput} onSend={handleSend} disabled={loading} placeholder="Is scheme ke baare mein poochhein..." />
      {showEligibilityModal && <EligibilityModal scheme={scheme} onClose={() => setShowEligibilityModal(false)} />}
    </div>
  );
}
