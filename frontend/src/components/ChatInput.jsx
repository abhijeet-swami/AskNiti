export function ChatInput({ value, onChange, onSend, disabled, placeholder }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSend();
  };

  return (
    <div className="p-3.5 bg-[#1a1a1a] border-t border-[#333333]">
      <div className="flex gap-2.5 bg-[#252525] border-2 border-[#333333] rounded-full px-4 py-1 focus-within:border-[#e8570a] focus-within:shadow-[0_0_0_3px_rgba(232,87,10,0.1)] transition-all">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || "Hindi ya English mein likhen…"}
          className="flex-1 border-none outline-none text-[0.95rem] py-2.5 bg-transparent text-white placeholder:text-[#666666]"
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="w-10 h-10 rounded-full bg-[#e8570a] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#c44a00] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
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
