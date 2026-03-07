export function Message({ type, children, avatar }) {
  const isUser = type === 'user';
  
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''} animate-[fadeUp_0.28s_ease]`}>
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
        style={{ 
          backgroundColor: isUser ? 'var(--saffron)' : 'var(--bg-card)',
          border: `2px solid ${isUser ? '#c44a00' : 'var(--border-color)'}`,
          color: isUser ? '#fff' : 'var(--text-primary)'
        }}
      >
        {avatar || (isUser ? 'U' : 'A')}
      </div>
      <div className={isUser ? 'max-w-[80%]' : 'max-w-[85%]'}>
        {children}
      </div>
    </div>
  );
}

export function Bubble({ children, type }) {
  const isUser = type === 'user';
  
  return (
    <div 
      className="px-4 py-3 rounded-[18px] text-[0.91rem] leading-relaxed"
      style={{ 
        backgroundColor: isUser ? 'var(--saffron)' : 'var(--bg-card)',
        color: isUser ? '#fff' : 'var(--text-primary)',
        borderBottomRightRadius: isUser ? '4px' : '18px',
        borderBottomLeftRadius: isUser ? '18px' : '4px',
        boxShadow: 'var(--shadow-sm, 0 2px 14px rgba(0,0,0,0.3))'
      }}
    >
      {children}
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex gap-1.5 items-center py-1">
      {[0, 1, 2].map(i => (
        <span 
          key={i}
          className="w-1.5 h-1.5 rounded-full animate-[bounce_1.2s_infinite]"
          style={{ 
            backgroundColor: 'var(--saffron)',
            animationDelay: `${i * 0.2}s`
          }}
        />
      ))}
    </div>
  );
}
