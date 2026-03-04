export function Message({ type, children, avatar }) {
  const isUser = type === 'user';
  
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''} animate-[fadeUp_0.28s_ease]`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
        isUser 
          ? 'bg-[#e8570a] border-2 border-[#c44a00]' 
          : 'bg-[#252525] border-2 border-[#333333]'
      }`}>
        {avatar || (isUser ? '👤' : '🏛️')}
      </div>
      <div className={isUser ? 'max-w-[78%]' : ''}>
        {children}
      </div>
    </div>
  );
}

export function Bubble({ children, type }) {
  const isUser = type === 'user';
  
  return (
    <div className={`px-4 py-3 rounded-[18px] text-[0.91rem] leading-relaxed ${
      isUser
        ? 'bg-[#e8570a] text-white rounded-br-sm'
        : 'bg-[#252525] text-[#e0e0e0] rounded-bl-sm shadow-[0_2px_14px_rgba(0,0,0,0.3)]'
    }`}>
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
          className="w-1.5 h-1.5 bg-[#e8570a] rounded-full animate-[bounce_1.2s_infinite]"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}
