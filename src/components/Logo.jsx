export default function Logo({ size = 24 }) {
  return (
    <div className="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <rect x="1" y="18" width="4" height="5" rx="2" fill="#0066FF" opacity="0.35"/>
        <rect x="6.5" y="12" width="4" height="11" rx="2" fill="#0066FF" opacity="0.6"/>
        <rect x="12" y="6" width="4" height="17" rx="2" fill="#0066FF" opacity="0.85"/>
        <rect x="17.5" y="1" width="4.5" height="22" rx="2.25" fill="#0066FF"/>
        <path d="M0 22.5 Q6 20 12 22.5 Q18 25 24 22.5" stroke="#0066FF" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.5"/>
      </svg>
      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '15px', color: 'var(--text)', letterSpacing: '-0.2px' }}>
        Texel Rating
      </span>
    </div>
  )
}
