import { BottomSheet, BottomSheetHeader, BottomSheetSection, ActionButton } from './BottomSheet';
import Badge from './Badge';

export function DetailPanel({ scheme, isOpen, onClose, onOpenEligibility, onOpenChat }) {
  if (!scheme) return null;
  
  const badges = [
    scheme.state && <Badge key="state" variant="state">{scheme.state}</Badge>,
    scheme.category && <Badge key="cat" variant="cat">{scheme.category}</Badge>,
  ].filter(Boolean);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={scheme.name}>
      <BottomSheetHeader title={scheme.name} onClose={onClose} badges={badges} />
      
      <BottomSheetSection label="Vivran (Description)">
        {scheme.description || 'Vivran upalabdh nahi hai.'}
      </BottomSheetSection>
      
      {scheme.benefits && (
        <BottomSheetSection label="Labh (Benefits)" variant="benefits">
          {scheme.benefits}
        </BottomSheetSection>
      )}
      
      {scheme.howToApply && (
        <BottomSheetSection label="Kaise Apply Karen" variant="how">
          {scheme.howToApply}
        </BottomSheetSection>
      )}
      
      <div className="px-5 py-4 grid grid-cols-2 gap-2.5 border-t border-[#e2dcd4]">
        <ActionButton variant="primary" onClick={onOpenChat}>
          🤖 AI se Poochein
        </ActionButton>
        <ActionButton variant="secondary" onClick={onOpenEligibility}>
          ✅ Eligibility Check
        </ActionButton>
        {scheme.source && (
          <a 
            href={scheme.source} 
            target="_blank" 
            rel="noopener noreferrer"
            className="col-span-2"
          >
            <ActionButton variant="outline" className="w-full">
              🌐 Official Website Dekhein
            </ActionButton>
          </a>
        )}
      </div>
    </BottomSheet>
  );
}
