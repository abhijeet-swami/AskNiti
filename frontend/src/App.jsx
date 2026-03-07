import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Message, Bubble, LoadingDots } from './components/Message';
import { ChatInput } from './components/ChatInput';
import { SchemeCard } from './components/SchemeCard';
import { useVoice } from './context/VoiceContext';
import { api } from './services/api';

const initialGreeting = (
  <div style={{ lineHeight: 1.65 }}>
    <strong style={{ fontFamily: "'Baloo 2', cursive", fontSize: '1.05rem' }}>Namaste!</strong><br />
    Main aapko aapke liye sabse sahi <em>sarkari yojana</em> dhoondhne mein madad karunga.<br /><br />
    Batayein — <strong>aapko kis cheez ke liye scheme chahiye?</strong><br />
    <small style={{ color: 'var(--text-muted)' }}>Jaise: padhai ke liye loan, kisan subsidy, business shuru karna, naukri ke liye training...</small>
  </div>
);

const profileQuestions = [
  { key: 'gender', label: 'Aapka gender kya hai?', options: { '1': 'Male', '2': 'Female', '3': 'Other' } },
  { key: 'caste', label: 'Aapka caste category kya hai?', options: { '1': 'General', '2': 'OBC', '3': 'SC', '4': 'ST' } },
  { key: 'age', label: 'Aapki age kya hai?' },
  { key: 'income', label: 'Aapki annual income kitni hai?', hint: 'Lakhs mein (e.g., 5 for 5 LPA)' },
];

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [collectingProfile, setCollectingProfile] = useState(false);
  const [profileAnswers, setProfileAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [schemes, setSchemes] = useState([]);
  
  const { speak } = useVoice();
  const chatEndRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      addBotMessage(initialGreeting);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addUserMessage = (content) => {
    setMessages(prev => [...prev, { type: 'user', content }]);
  };

  const addBotMessage = (content) => {
    setMessages(prev => [...prev, { type: 'bot', content }]);
  };

  const askNextQuestion = () => {
    if (currentQuestionIndex < profileQuestions.length) {
      showQuestion(currentQuestionIndex);
    } else {
      sendProfileAnswers();
    }
  };

  const showQuestion = (index) => {
    if (index < profileQuestions.length) {
      const q = profileQuestions[index];
      let hint = q.hint || '';
      if (q.options) {
        hint = Object.entries(q.options).map(([k, v]) => `${k} for ${v}`).join(', ');
      }
      
      const fullText = `${q.label} ${hint}`;
      speak(fullText);
      
      addBotMessage(
        <div>
          <div 
            className="border-l-4 p-3 rounded-r-lg text-sm"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--saffron)',
              color: 'var(--text-primary)'
            }}
          >
            {q.label}
          </div>
          {hint && <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{hint}</small>}
        </div>
      );
    }
  };

  const sendProfileAnswers = async () => {
    setLoading(true);
    try {
      const conversationHistory = Object.entries(profileAnswers).map(([key, value]) => ({
        role: 'user',
        content: `${key}: ${value}`,
        timestamp: new Date(),
      }));

      const metadata = {
        gender: profileAnswers.gender || null,
        caste: profileAnswers.caste || null,
        age: profileAnswers.age ? Number(profileAnswers.age) : null,
      };

      const response = await api.sendMessage('', conversationHistory, { metadata });
      const data = response.data;
      
      if (data?.schemes && data.schemes.length > 0) {
        setSchemes(data.schemes);
        addBotMessage(
          <div>
            <div 
              className="text-lg font-bold mb-3"
              style={{ color: 'var(--saffron)' }}
            >
              {data.schemes.length} Schemes found for you
            </div>
            <div className="flex flex-col gap-2">
              {data.schemes.slice(0, 10).map((scheme, i) => (
                <SchemeCard key={scheme._id || scheme.slug || i} scheme={scheme} />
              ))}
            </div>
          </div>
        );
      } else if (data?.reply) {
        addBotMessage(data.reply);
      } else {
        addBotMessage(
          <div 
            className="border-l-4 p-3 rounded-r-lg text-sm"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--saffron)',
              color: 'var(--text-primary)'
            }}
          >
            No schemes found matching your criteria. Try a different query or adjust your filters.
          </div>
        );
      }
      setCollectingProfile(false);
      setProfileAnswers({});
      setCurrentQuestionIndex(0);
    } catch (err) {
      addBotMessage(
        <div 
          className="border-l-4 p-3 rounded-r-lg text-sm"
          style={{ 
            backgroundColor: '#fee2e2',
            borderColor: '#dc2626',
            color: '#7f1d1d'
          }}
        >
          Error: {err.message}
        </div>
      );
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const text = input.trim();
    
    if (collectingProfile) {
      const currentKey = profileQuestions[currentQuestionIndex].key;
      let answer = text;
      
      // Convert numeric input to actual value if options exist
      const q = profileQuestions[currentQuestionIndex];
      if (q.options && q.options[text]) {
        answer = q.options[text];
      }
      
      setProfileAnswers(prev => ({ ...prev, [currentKey]: answer }));
      addUserMessage(answer);
      setInput('');
      
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      if (nextIndex < profileQuestions.length) {
        showQuestion(nextIndex);
      } else {
        sendProfileAnswers();
      }
      return;
    }
    
    addUserMessage(text);
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendMessage(text);
      const data = response.data;
      
      if (data?.intentReady) {
        setCollectingProfile(true);
        setCurrentQuestionIndex(0);
        setProfileAnswers({});
        setSchemes([]);
        showQuestion(0);
      } else if (data?.schemes && data.schemes.length > 0) {
        setSchemes(data.schemes);
        addBotMessage(
          <div>
            <div 
              className="text-lg font-bold mb-3"
              style={{ color: 'var(--saffron)' }}
            >
              {data.schemes.length} Schemes found for you
            </div>
            <div className="flex flex-col gap-2">
              {data.schemes.slice(0, 10).map((scheme, i) => (
                <SchemeCard key={scheme._id || scheme.slug || i} scheme={scheme} />
              ))}
            </div>
          </div>
        );
      } else if (data?.reply) {
        addBotMessage(data.reply);
      } else {
        addBotMessage(
          <div 
            className="border-l-4 p-3 rounded-r-lg text-sm"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--saffron)',
              color: 'var(--text-primary)'
            }}
          >
            No schemes found matching your criteria. Try a different query or adjust your filters.
          </div>
        );
      }
    } catch (err) {
      addBotMessage(
        <div 
          className="border-l-4 p-3 rounded-r-lg text-sm"
          style={{ 
            backgroundColor: '#fee2e2',
            borderColor: '#dc2626',
            color: '#7f1d1d'
          }}
        >
          Error: {err.message}
        </div>
      );
    }
    setLoading(false);
  };

  const handleNewSearch = () => {
    setCollectingProfile(false);
    setProfileAnswers({});
    setCurrentQuestionIndex(0);
    setSchemes([]);
    localStorage.removeItem('x-session-id');
    addBotMessage(initialGreeting);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSchemes([]);
    setCollectingProfile(false);
    setProfileAnswers({});
    setCurrentQuestionIndex(0);
    localStorage.removeItem('x-session-id');
    window.location.reload();
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <Header />
      
      <div 
        className="flex-1 max-w-2xl w-full mx-auto flex flex-col h-[calc(100vh-65px)]"
      >
        <div 
          className="flex-1 overflow-y-auto p-3 sm:p-5 pb-3 flex flex-col gap-2.5"
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
          placeholder={collectingProfile ? 
            profileQuestions[currentQuestionIndex]?.label || 'Type your answer...' : 
            'Hindi ya English mein likhen...'}
        />
      </div>

      {schemes.length > 0 && (
        <button
          onClick={handleNewChat}
          className="fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 z-10"
          style={{ 
            backgroundColor: 'var(--saffron)',
            color: '#fff'
          }}
        >
          + New Chat
        </button>
      )}

      {collectingProfile && (
        <div 
          className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-muted)'
          }}
        >
          {currentQuestionIndex} / {profileQuestions.length} questions answered
        </div>
      )}
    </div>
  );
}

export default App;
