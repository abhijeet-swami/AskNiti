import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Message, Bubble, LoadingDots } from './components/Message';
import { SchemeList } from './components/SchemeCard';
import { ChatInput } from './components/ChatInput';
import { ProfileForm } from './components/ProfileForm';
import { DetailPanel } from './components/DetailPanel';
import { EligibilityPanel } from './components/EligibilityPanel';
import { SchemeChatPanel } from './components/SchemeChatPanel';
import { api } from './services/api';
import { fieldLabels } from './utils/theme';

const initialGreeting = (
  <div style={{ lineHeight: 1.65 }}>
    <strong style={{ fontFamily: "'Baloo 2', cursive", fontSize: '1.05rem' }}>🙏 Namaste!</strong><br />
    Main aapko aapke liye sabse sahi <em>sarkari yojana</em> dhoondhne mein madad karunga.<br /><br />
    Batayein — <strong>aapko kis cheez ke liye scheme chahiye?</strong><br />
    <small style={{ color: '#888' }}>Jaise: padhai ke liye loan, kisan subsidy, business shuru karna, naukri ke liye training…</small>
  </div>
);

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState({
    conversationHistory: [],
    userProfile: {},
    phase: 'intent',
  });
  
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [eligOpen, setEligOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  const chatEndRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      addBotMessage(initialGreeting);
    }
  }, []);

  const escapeHTML = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const addUserMessage = (content) => {
    setMessages(prev => [...prev, { type: 'user', content }]);
  };

  const addBotMessage = (content) => {
    setMessages(prev => [...prev, { type: 'bot', content }]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const text = input.trim();
    addUserMessage(text);
    setInput('');
    setLoading(true);

    try {
      const data = await api.query(text, session);
      if (data.session) setSession(data.session);
      handleResponse(data);
    } catch (err) {
      addBotMessage(
        <div className="bg-[#fee2e2] border-l-4 border-[#dc2626] p-3 rounded-r-lg text-[#7f1d1d] text-sm">
          ❌ Error: {err.message}
        </div>
      );
    }
    setLoading(false);
  };

  const handleResponse = (data) => {
    if (data.action === 'ask') {
      const profile = session.userProfile || {};
      const entries = Object.entries(profile).filter(
        ([, v]) => v !== undefined && v !== null && v !== ''
      );
      let html = `<div class="bg-[#fff3ec] border-l-4 border-[#e8570a] p-3 rounded-r-lg text-sm">💬 ${escapeHTML(data.question)}</div>`;
      if (entries.length > 0) {
        const known = entries
          .map(([k, v]) => `<strong>${fieldLabels[k] || k}:</strong> ${escapeHTML(String(v))}`)
          .join(' · ');
        html += `<div class="bg-[#eaedfa] border border-[rgba(15,31,110,0.12)] rounded-lg p-2.5 text-xs text-[#1a3499] mt-1.5">✅ ${known}</div>`;
      }
      addBotMessage(<div dangerouslySetInnerHTML={{ __html: html }} />);
    } else if (data.action === 'collect_static') {
      addBotMessage(
        <ProfileForm
          questions={data.questions}
          intentSummary={data.intentSummary}
          onSubmit={(answers) => handleProfileSubmit(answers, data.intentSummary)}
        />
      );
    } else if (data.action === 'match') {
      showMatchHeader(data.matchedSchemes?.length || 0);
      addBotMessage(
        <SchemeList
          schemes={data.matchedSchemes}
          onSelectScheme={openSchemeDetail}
        />
      );
      if (data.reasoning) {
        addBotMessage(
          <div className="text-[#6b6880] text-xs italic pt-1">ℹ️ {data.reasoning}</div>
        );
      }
      addNewSearchButton();
    } else if (data.action === 'no-match') {
      addBotMessage(
        <div className="bg-[#fee2e2] border-l-4 border-[#dc2626] p-3 rounded-r-lg text-[#7f1d1d] text-sm">
          🔍 {data.message || 'Koi matching scheme nahi mili.'}
        </div>
      );
      addNewSearchButton();
    } else {
      addBotMessage(
        <div className="bg-[#fee2e2] border-l-4 border-[#dc2626] p-3 rounded-r-lg text-[#7f1d1d] text-sm">
          ⚠️ Session khatam ho gaya. Naya search karein.
        </div>
      );
      addNewSearchButton();
    }
  };

  const handleProfileSubmit = async (answers, intentSummary) => {
    const summaryParts = Object.entries(answers)
      .map(([k, v]) => `${fieldLabels[k] || k}: ${v}`)
      .join(' · ');
    addUserMessage(summaryParts);

    setLoading(true);
    try {
      const data = await api.query(summaryParts, {
        ...session,
        staticAnswers: answers,
        phase: 'static',
      });
      if (data.session) setSession(data.session);
      handleResponse(data);
    } catch (err) {
      addBotMessage(
        <div className="bg-[#fee2e2] border-l-4 border-[#dc2626] p-3 rounded-r-lg text-[#7f1d1d] text-sm">
          ❌ Error: {err.message}
        </div>
      );
    }
    setLoading(false);
  };

  const showMatchHeader = (count) => {
    if (count === 0) return;
    const profile = session.userProfile || {};
    const pParts = Object.entries(profile)
      .filter(([, v]) => v)
      .map(([k, v]) => `${fieldLabels[k] || k}: <strong>${escapeHTML(String(v))}</strong>`)
      .join(' | ');
    
    addBotMessage(
      <div className="bg-gradient-to-r from-[#0f1f6e] to-[#1a3499] text-white rounded-lg p-4 mb-1 w-full">
        <div className="text-3xl font-extrabold text-[#e8570a]">{count}</div>
        <div className="text-sm text-white/75">Scheme{count > 1 ? 's' : ''} mili aapke liye!</div>
        {pParts && <div className="text-xs text-white/55 border-t border-white/12 pt-2 mt-2">{pParts}</div>}
      </div>
    );
  };

  const addNewSearchButton = () => {
    addBotMessage(
      <button
        onClick={handleNewSearch}
        className="block mx-auto mt-2.5 bg-[#107a0d] text-white rounded-full px-7 py-3 text-sm font-semibold hover:bg-[#0a5e08] transition-colors"
      >
        🔍 Naya Search Karein
      </button>
    );
  };

  const handleNewSearch = () => {
    setSession({
      conversationHistory: [],
      userProfile: {},
      phase: 'intent',
    });
    addBotMessage(initialGreeting);
  };

  const openSchemeDetail = (scheme) => {
    setSelectedScheme(scheme);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-[660px] w-full mx-auto flex flex-col h-[calc(100vh-65px)]">
        <div 
          className="flex-1 overflow-y-auto p-5 pb-3 flex flex-col gap-2.5"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((msg, i) => (
            <Message key={i} type={msg.type}>
              {typeof msg.content === 'string' ? (
                <Bubble type={msg.type}>{msg.content}</Bubble>
              ) : (
                msg.content
              )}
            </Message>
          ))}
          
          {loading && messages.length > 0 && messages[messages.length - 1]?.type === 'user' && (
            <Message type="bot">
              <LoadingDots />
            </Message>
          )}
          
          <div ref={chatEndRef} />
        </div>

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={loading}
        />
      </div>

      <DetailPanel
        scheme={selectedScheme}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onOpenEligibility={() => { setDetailOpen(false); setEligOpen(true); }}
        onOpenChat={() => { setDetailOpen(false); setChatOpen(true); }}
      />

      <EligibilityPanel
        scheme={selectedScheme}
        isOpen={eligOpen}
        onClose={() => setEligOpen(false)}
      />

      <SchemeChatPanel
        scheme={selectedScheme}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}

export default App;
