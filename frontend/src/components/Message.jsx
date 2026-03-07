export function Message({ type, children }) {
  const isUser = type === 'user';
  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-[fadeUp_0.3s_ease]`}>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0" style={{ backgroundColor: isUser ? '#10a37f' : 'var(--bg-card)', border: isUser ? 'none' : '1px solid var(--border-color)', color: isUser ? '#fff' : 'var(--text-primary)' }}>
        {isUser ? 'U' : 'AI'}
      </div>
      <div className={isUser ? 'max-w-[75%] sm:max-w-[70%]' : 'max-w-[85%]'}>{children}</div>
    </div>
  );
}

export function Bubble({ children, type }) {
  const isUser = type === 'user';
  return (
    <div className="px-4 py-3 rounded-2xl text-[0.95rem] leading-relaxed whitespace-pre-wrap" style={{ backgroundColor: isUser ? '#10a37f' : 'transparent', color: isUser ? '#fff' : 'var(--text-primary)' }}>
      {children}
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex gap-1 items-center py-2">
      {[0, 0.2, 0.4].map((delay, i) => (
        <span key={i} className="w-2 h-2 rounded-full animate-[bounce_1.4s_infinite_ease-in-out]" style={{ backgroundColor: '#10a37f', animationDelay: `${delay}s` }} />
      ))}
    </div>
  );
}
