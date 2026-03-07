export function ChatInput({ value, onChange, onSend, disabled, placeholder }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
      <div className="flex gap-2 rounded-xl items-end focus-within:ring-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || "Message likhein..."}
          rows={1}
          className="flex-1 border-none outline-none text-[0.95rem] py-3 px-4 bg-transparent resize-none max-h-32"
          style={{ color: 'var(--text-primary)' }}
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="m-2 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80 disabled:opacity-40"
          style={{ backgroundColor: value.trim() ? '#10a37f' : 'var(--bg-secondary)', color: '#fff' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
      <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>AI se galti ho sakti hai. Jaankari khud verify karein.</p>
    </div>
  );
}
