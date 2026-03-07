function Badge({ children, variant = 'default' }) {
  const variants = {
    state: { bg: '#ebf7ea', color: '#107a0d' },
    cat: { bg: '#eaedfa', color: '#1a3499' },
    saffron: { bg: '#fff3ec', color: '#c44a00' },
  };
  const style = variants[variant] || { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' };
  
  return (
    <span 
      className="text-[0.67rem] px-2.5 py-1 rounded-full whitespace-nowrap font-semibold"
      style={{ 
        backgroundColor: style.bg, 
        color: style.color 
      }}
    >
      {children}
    </span>
  );
}

import { SpeakButton } from './VoiceButtons';

export function SchemeCard({ scheme, onClick, delay = 0 }) {
  const topTags = (scheme.tags || []).slice(0, 3);
  
  return (
    <div 
      className="rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01]"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        animationDelay: `${delay}ms`
      }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 
          className="font-bold text-[0.9rem] leading-tight line-clamp-2"
          style={{ color: 'var(--navy)' }}
        >
          {scheme.name || 'Unnamed Scheme'}
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge variant="state">{scheme.state || 'All India'}</Badge>
        {scheme.category && <Badge variant="cat">{scheme.category}</Badge>}
      </div>
      
      <p 
        className="text-sm leading-relaxed mb-3 line-clamp-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {scheme.description?.slice(0, 150) || ''}
        {(scheme.description || '').length > 150 && '...'}
      </p>
      
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {topTags.map((tag, i) => (
            <span 
              key={i} 
              className="text-[0.64rem] px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)' 
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <SpeakButton text={scheme.description || scheme.name} size="sm" />
          <button 
            className="px-3 py-1.5 rounded-full text-[0.77rem] font-semibold transition-colors flex-shrink-0"
            style={{ 
              backgroundColor: 'var(--saffron)', 
              color: '#fff' 
            }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export function SchemeList({ schemes, onSelectScheme }) {
  if (!schemes?.length) return null;
  
  return (
    <div className="flex flex-col gap-3 w-full">
      {schemes.map((scheme, i) => (
        <SchemeCard 
          key={scheme.slug || scheme._id || i} 
          scheme={scheme} 
          onClick={() => onSelectScheme(scheme)}
          delay={i * 70}
        />
      ))}
    </div>
  );
}
