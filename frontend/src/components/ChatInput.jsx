import { MicButton } from './VoiceButtons';

export function ChatInput({ value, onChange, onSend, disabled, placeholder }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSend();
  };

  const handleMicResult = (text) => {
    onChange(text);
    setTimeout(() => onSend(), 100);
  };

  return (
    <div 
      className="p-3 sm:p-4 border-t"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div 
        className="flex gap-2 rounded-full px-3 py-1 items-center focus-within:border-[#e8570a] transition-all"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          border: '2px solid var(--border-color)'
        }}
      >
        <MicButton onResult={handleMicResult} disabled={disabled} />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || "Type here..."}
          className="flex-1 border-none outline-none text-[0.95rem] py-2.5 bg-transparent"
          style={{ 
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: 'var(--saffron)',
            color: '#fff'
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
