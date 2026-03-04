export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-[#f5f0ea] text-[#1a1225]',
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
