import { useState, useEffect, useRef, createContext, useContext } from 'react';

const VoiceContext = createContext();

export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('voiceLang') || 'en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    const checkSupport = () => {
      setSpeechSupported('speechSynthesis' in window);
      setRecognitionSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    };
    checkSupport();
    loadVoices();
  }, []);

  useEffect(() => {
    localStorage.setItem('voiceLang', language);
    loadVoices();
  }, [language]);

  const loadVoices = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
    }
  };

  const hasHindiVoice = () => {
    if (!('speechSynthesis' in window)) return false;
    const voices = speechSynthesis.getVoices();
    return voices.some(v => v.lang.includes('hi'));
  };

  const speak = async (text) => {
    if (!text) return;

    if (!speechSupported) return;

    window.speechSynthesis.cancel();

    // Use Google TTS fallback for Hindi if no voice available
    if (language === 'hi' && !hasHindiVoice()) {
      try {
        setIsSpeaking(true);
        const audio = new Audio();
        const encodedText = encodeURIComponent(text);
        audio.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encodedText}`;
        
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        
        await audio.play();
        return;
      } catch (err) {
        console.error('TTS fallback failed:', err);
        setIsSpeaking(false);
      }
    }

    // Native TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => 
      language === 'hi' ? v.lang.includes('hi') : v.lang.includes('en')
    ) || voices[0];

    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = (onResult) => {
    if (!recognitionSupported) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  return (
    <VoiceContext.Provider value={{
      language,
      toggleLanguage,
      isSpeaking,
      isListening,
      speechSupported,
      recognitionSupported,
      speak,
      stopSpeaking,
      startListening,
      stopListening
    }}>
      {children}
    </VoiceContext.Provider>
  );
};
