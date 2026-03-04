export function Header() {
  return (
    <>
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[#0f1f6e] to-[#1a3499] px-5 h-[62px] flex items-center gap-3.5 shadow-[0_3px_20px_rgba(15,31,110,0.35)]">
        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">AskNiti</h1>
          <p className="text-white/50 text-xs">GOVERNMENT SCHEME FINDER</p>
        </div>
      </header>
      <div className="h-[3px] bg-gradient-to-r from-[#e8570a] via-white to-[#107a0d]" />
    </>
  );
}
