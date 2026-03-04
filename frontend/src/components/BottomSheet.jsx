import { useEffect } from 'react';

export function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-end transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-[660px] max-h-[92vh] rounded-[22px_22px_0_0] overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] translate-y-0">
        <div className="w-10 h-1 bg-[#e2dcd4] rounded-full mx-auto mt-3.5" />
        {children}
      </div>
    </div>
  );
}

export function BottomSheetHeader({ title, onClose, badges }) {
  return (
    <div className="flex justify-between items-start px-5 py-4 border-b border-[#e2dcd4] gap-3">
      <div className="flex-1">
        <h2 className="text-[#0f1f6e] font-bold text-lg mb-2">{title}</h2>
        <div className="flex gap-1.5 flex-wrap">
          {badges}
        </div>
      </div>
      <button 
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-[#f5f0ea] border border-[#e2dcd4] flex items-center justify-center text-[#6b6880] hover:bg-[#e2dcd4] transition-colors flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

export function BottomSheetSection({ label, children, variant }) {
  const variants = {
    benefits: 'bg-[#ebf7ea] border-l-4 border-[#107a0d] text-[#1a4d18]',
    how: 'bg-[#eaedfa] border-l-4 border-[#1a3499] text-[#1a2a7a]',
    default: '',
  };
  
  return (
    <div className="px-5 py-4">
      <p className="text-[#6b6880] text-xs uppercase tracking-wider font-semibold mb-2">{label}</p>
      {variant ? (
        <div className={`p-3 rounded-r-[12px] text-sm leading-relaxed ${variants[variant]}`}>
          {children}
        </div>
      ) : (
        <p className="text-[#1a1225] text-sm leading-relaxed">{children}</p>
      )}
    </div>
  );
}

export function ActionButton({ children, variant = 'primary', onClick, className = '' }) {
  const variants = {
    primary: 'bg-[#e8570a] text-white hover:bg-[#c44a00]',
    secondary: 'bg-[#0f1f6e] text-white hover:bg-[#08145a]',
    success: 'bg-[#107a0d] text-white hover:bg-[#0a5e08]',
    outline: 'bg-transparent border-2 border-[#e2dcd4] text-[#1a1225] hover:bg-[#f5f0ea]',
  };
  
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-3 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
