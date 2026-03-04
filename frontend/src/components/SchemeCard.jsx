import { theme } from '../utils/theme';

function Badge({ children, variant = 'default' }) {
  const variants = {
    state: 'bg-[#ebf7ea] text-[#107a0d]',
    cat: 'bg-[#eaedfa] text-[#1a3499]',
    saffron: 'bg-[#fff3ec] text-[#c44a00]',
  };
  
  return (
    <span className={`text-[0.67rem] px-2.5 py-1 rounded-full whitespace-nowrap font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function SchemeCard({ scheme, onClick, delay = 0 }) {
  const topTags = (scheme.tags || []).slice(0, 3);
  
  return (
    <div 
      className="bg-white border border-[#e2dcd4] rounded-[12px] p-4 shadow-[0_2px_14px_rgba(0,0,0,0.08)] cursor-pointer hover:shadow-[0_4px_22px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <h3 className="text-[#0f1f6e] font-bold text-[0.96rem] leading-tight">
          {scheme.name || 'Unnamed Scheme'}
        </h3>
        <Badge variant="state">{scheme.state || 'All India'}</Badge>
      </div>
      
      <div className="mb-2.5">
        <Badge variant="cat">{scheme.category || ''}</Badge>
      </div>
      
      <p className="text-[#6b6880] text-sm leading-relaxed mb-3 line-clamp-2">
        {scheme.description?.slice(0, 175) || ''}
        {(scheme.description || '').length > 175 && '…'}
      </p>
      
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {topTags.map((tag, i) => (
            <span key={i} className="text-[0.64rem] px-2 py-0.5 bg-[#f5f0ea] border border-[#e2dcd4] rounded-full text-[#6b6880]">
              {tag}
            </span>
          ))}
        </div>
        <button 
          className="px-3.5 py-1.5 rounded-full bg-[#e8570a] text-white text-[0.77rem] font-semibold hover:bg-[#c44a00] transition-colors flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          View →
        </button>
      </div>
    </div>
  );
}

export function SchemeList({ schemes, onSelectScheme }) {
  if (!schemes?.length) return null;
  
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {schemes.map((scheme, i) => (
        <SchemeCard 
          key={scheme.slug || i} 
          scheme={scheme} 
          onClick={() => onSelectScheme(scheme)}
          delay={i * 70}
        />
      ))}
    </div>
  );
}
