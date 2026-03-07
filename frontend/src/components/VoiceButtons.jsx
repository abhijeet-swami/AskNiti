import { useVoice } from '../context/VoiceContext';

export function MicButton({ onResult, disabled }) {
  const { startListening, stopListening, isListening, recognitionSupported } = useVoice();

  if (!recognitionSupported) return null;

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        if (onResult) onResult(text);
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
        isListening ? 'animate-pulse' : ''
      }`}
      style={{ 
        backgroundColor: isListening ? '#dc2626' : 'var(--bg-secondary)',
        border: `2px solid ${isListening ? '#dc2626' : 'var(--border-color)'}`,
        color: isListening ? '#fff' : 'var(--text-primary)'
      }}
      title={isListening ? 'Stop listening' : 'Voice input'}
    >
      {isListening ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      )}
    </button>
  );
}

export function SpeakButton({ text, size = 'md' }) {
  const { speak, isSpeaking, stopSpeaking } = useVoice();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all hover:scale-110`}
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        border: `2px solid var(--border-color)`,
        color: 'var(--text-primary)'
      }}
      title={isSpeaking ? 'Stop' : 'Listen'}
    >
      {isSpeaking ? (
        <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z"/>
        </svg>
      ) : (
        <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      )}
    </button>
  );
}

export function LanguageToggle() {
  const { language, toggleLanguage, isSpeaking } = useVoice();

  return (
    <button
      onClick={toggleLanguage}
      disabled={isSpeaking}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={{ 
        backgroundColor: 'var(--saffron)',
        color: '#fff',
        opacity: isSpeaking ? 0.5 : 1
      }}
      title="Switch language"
    >
      {language === 'en' ? 'EN' : 'HI'}
    </button>
  );
}
