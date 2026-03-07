import { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { Message, Bubble, LoadingDots } from "./components/Message";
import { ChatInput } from "./components/ChatInput";
import { SchemeCard } from "./components/SchemeCard";
import { SchemeDetail } from "./components/SchemeDetail";
import { useVoice } from "./context/VoiceContext";
import { useTheme } from "./context/ThemeContext";
import { api } from "./services/api";

const initialGreeting = (
  <div style={{ lineHeight: 1.6 }}>
    <strong style={{ fontSize: "1.1rem" }}>Namaste! 🙏</strong>
    <br />
    <br />
    Main aapko aapke liye sabse sahi <em>sarkari yojana</em> dhoondhne mein
    madad karunga.
    <br />
    <br />
    Batayein — <strong>aapko kis cheez ke liye scheme chahiye?</strong>
    <br />
    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
      Jaise: padhai ke liye loan, kisan subsidy, business, naukri...
    </span>
  </div>
);

const profileQuestions = [
  {
    key: "gender",
    label: "Aapka gender kya hai?",
    options: { 1: "Male", 2: "Female", 3: "Other" },
  },
  {
    key: "caste",
    label: "Aapka caste category kya hai?",
    options: { 1: "General", 2: "OBC", 3: "SC", 4: "ST" },
  },
  { key: "age", label: "Aapki age kya hai?" },
  {
    key: "income",
    label: "Aapki annual income kitni hai?",
    hint: "Lakhs mein (e.g., 5 for 5 LPA)",
  },
];

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverStarting, setServerStarting] = useState(false);
  const [collectingProfile, setCollectingProfile] = useState(false);
  const [profileAnswers, setProfileAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const { speak } = useVoice();
  const { theme, toggleTheme } = useTheme();

  const chatEndRef = useRef(null);
  const initialized = useRef(false);
  const firstMessageSent = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      addBotMessage(initialGreeting);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addUserMessage = (content) =>
    setMessages((prev) => [...prev, { type: "user", content }]);

  const addBotMessage = (content) =>
    setMessages((prev) => [...prev, { type: "bot", content }]);

  const showQuestion = (index) => {
    if (index < profileQuestions.length) {
      const q = profileQuestions[index];

      let hint = q.hint || "";

      if (q.options)
        hint = Object.entries(q.options)
          .map(([k, v]) => `${k} = ${v}`)
          .join("  ");

      const fullText = `${q.label} ${hint}`;

      speak(fullText);

      addBotMessage(
        <div style={{ color: "var(--text-primary)" }}>
          {q.label}
          {hint && (
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                marginTop: "4px",
              }}
            >
              {hint}
            </div>
          )}
        </div>,
      );
    }
  };

  const ensureServerAwake = async () => {
    if (firstMessageSent.current || serverStarting) return true;

    firstMessageSent.current = true;
    setServerStarting(true);

    try {
      const awake = await api.wakeUp();

      if (!awake) {
        alert("Server shuru nahi ho paaya. Thodi der baad try karein.");
        firstMessageSent.current = false;
        return false;
      }

      return true;
    } catch (err) {
      console.error(err);
      alert("Server se connect nahi ho pa raha.");
      firstMessageSent.current = false;
      return false;
    } finally {
      setServerStarting(false);
    }
  };

  const sendProfileAnswers = async () => {
    setLoading(true);

    try {
      const awake = await ensureServerAwake();
      if (!awake) {
        setLoading(false);
        return;
      }

      const conversationHistory = Object.entries(profileAnswers).map(
        ([key, value]) => ({
          role: "user",
          content: `${key}: ${value}`,
          timestamp: new Date(),
        }),
      );

      const metadata = {
        gender: profileAnswers.gender || null,
        caste: profileAnswers.caste || null,
        age: profileAnswers.age ? Number(profileAnswers.age) : null,
      };

      if (metadata.age) localStorage.setItem("userAge", metadata.age);
      if (metadata.gender) localStorage.setItem("userGender", metadata.gender);
      if (metadata.caste) localStorage.setItem("userCaste", metadata.caste);

      const response = await api.sendMessage("", conversationHistory, {
        metadata,
      });

      const data = response.data;

      if (data?.schemes && data.schemes.length > 0) {
        setSchemes(data.schemes);

        addBotMessage(
          <div>
            <div
              style={{
                color: "#10a37f",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              {data.schemes.length} Schemes mil gaye hain aapke liye
            </div>

            <div className="flex flex-col gap-3">
              {data.schemes.slice(0, 10).map((scheme, i) => (
                <SchemeCard
                  key={scheme._id || scheme.slug || i}
                  scheme={scheme}
                  onClick={() => openSchemeDetail(scheme)}
                />
              ))}
            </div>
          </div>,
        );
      } else if (data?.reply) {
        addBotMessage(data.reply);
      } else {
        addBotMessage("Koi scheme nahi mila. Koi aur query try karein.");
      }

      setCollectingProfile(false);
      setProfileAnswers({});
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error(err);
      addBotMessage("Kuch technical problem aa gayi. Dobara try karein.");
    }

    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();

    if (collectingProfile) {
      const currentKey = profileQuestions[currentQuestionIndex].key;

      let answer = text;

      const q = profileQuestions[currentQuestionIndex];

      if (q.options && q.options[text]) answer = q.options[text];

      setProfileAnswers((prev) => ({ ...prev, [currentKey]: answer }));

      addUserMessage(answer);
      setInput("");

      const nextIndex = currentQuestionIndex + 1;

      setCurrentQuestionIndex(nextIndex);

      if (nextIndex < profileQuestions.length) showQuestion(nextIndex);
      else sendProfileAnswers();

      return;
    }

    addUserMessage(text);
    setInput("");
    setLoading(true);

    try {
      const awake = await ensureServerAwake();

      if (!awake) {
        setLoading(false);
        return;
      }

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
              style={{
                color: "#10a37f",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              {data.schemes.length} Schemes mil gaye hain aapke liye
            </div>

            <div className="flex flex-col gap-3">
              {data.schemes.slice(0, 10).map((scheme, i) => (
                <SchemeCard
                  key={scheme._id || scheme.slug || i}
                  scheme={scheme}
                  onClick={() => openSchemeDetail(scheme)}
                />
              ))}
            </div>
          </div>,
        );
      } else if (data?.reply) {
        addBotMessage(data.reply);
      } else {
        addBotMessage("Koi scheme nahi mila. Koi aur query try karein.");
      }
    } catch (err) {
      console.error(err);
      addBotMessage("Server se response nahi mila. Dobara try karein.");
    }

    setLoading(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSchemes([]);
    setCollectingProfile(false);
    setProfileAnswers({});
    setCurrentQuestionIndex(0);
    setSelectedScheme(null);

    localStorage.removeItem("x-session-id");
    localStorage.removeItem("userAge");
    localStorage.removeItem("userGender");
    localStorage.removeItem("userCaste");
    localStorage.removeItem("userBPL");

    firstMessageSent.current = false;

    addBotMessage(initialGreeting);
  };

  const openSchemeDetail = (scheme) => setSelectedScheme(scheme);
  const closeSchemeDetail = () => setSelectedScheme(null);

  if (selectedScheme)
    return <SchemeDetail scheme={selectedScheme} onBack={closeSchemeDetail} />;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Header onThemeToggle={toggleTheme} isDark={theme === "dark"} />

      <div className="flex-1 max-w-3xl w-full mx-auto flex flex-col h-[calc(100vh-60px)]">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <Message key={i} type={msg.type}>
              {typeof msg.content === "string" ? (
                <Bubble type={msg.type}>{msg.content}</Bubble>
              ) : (
                msg.content
              )}
            </Message>
          ))}

          {loading &&
            messages.length > 0 &&
            messages[messages.length - 1]?.type === "user" && (
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
          disabled={loading || serverStarting}
          placeholder={
            collectingProfile
              ? profileQuestions[currentQuestionIndex]?.label ||
                "Apna answer likhein..."
              : "Sarkari schemes ke baare mein poochhein..."
          }
        />
      </div>

      {schemes.length > 0 && (
        <button
          onClick={handleNewChat}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 shadow-lg"
          style={{ backgroundColor: "#10a37f", color: "#fff" }}
        >
          + Naya Chat
        </button>
      )}

      {serverStarting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded-lg shadow-lg text-center">
            <div className="font-medium">Server shuru ho raha hai...</div>
            <div className="text-sm text-gray-500 mt-1">Please wait</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
