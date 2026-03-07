export function SchemeCard({ scheme, onClick }) {
  return (
    <div className="rounded-xl p-4 cursor-pointer transition-all hover:shadow-md border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} onClick={onClick}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[0.95rem] leading-tight line-clamp-2 mb-2" style={{ color: 'var(--text-primary)' }}>{scheme.name || 'Unnamed Scheme'}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-[0.75rem] px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: '#10a37f20', color: '#10a37f' }}>{scheme.state || 'All India'}</span>
            {scheme.category && <span className="text-[0.75rem] px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: '#37415120', color: 'var(--text-secondary)' }}>{scheme.category}</span>}
          </div>
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{scheme.description?.slice(0, 180) || ''}{(scheme.description || '').length > 180 && '...'}</p>
        </div>
        <button className="px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0 self-center" style={{ backgroundColor: '#10a37f', color: '#fff' }} onClick={(e) => { e.stopPropagation(); onClick(); }}>Dekhein</button>
      </div>
    </div>
  );
}
