export default function ClaudeBubbles() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1, /* Behind everything */
      overflow: 'hidden',
      pointerEvents: 'none',
      opacity: 0.6
    }}>
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Bubble 1 */}
        <g transform="translate(200, 150) rotate(-10)">
          <rect width="180" height="70" rx="35" fill="rgba(255,255,255,0.03)" />
          <path d="M 40 35 Q 50 25, 60 35 T 80 35 T 100 35 T 120 35 T 140 35" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
        </g>
        
        {/* Bubble 2 */}
        <g transform="translate(600, 100) rotate(5)">
          <rect width="220" height="80" rx="40" fill="rgba(255,255,255,0.02)" />
          <path d="M 50 40 Q 65 25, 80 40 T 110 40 T 140 40 T 170 40" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
        </g>
        
        {/* Bubble 3 */}
        <g transform="translate(100, 400) rotate(-15)">
          <rect width="160" height="60" rx="30" fill="rgba(255,255,255,0.04)" />
          <path d="M 30 30 Q 40 20, 50 30 T 70 30 T 90 30 T 110 30 T 130 30" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
        </g>

        {/* Bubble 4 */}
        <g transform="translate(750, 350) rotate(10)">
          <rect width="190" height="65" rx="32.5" fill="rgba(255,255,255,0.02)" />
          <path d="M 40 32.5 Q 55 20, 70 32.5 T 100 32.5 T 130 32.5 T 150 32.5" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
        </g>
        
        {/* Bubble 5 */}
        <g transform="translate(450, 550) rotate(-5)">
          <rect width="150" height="55" rx="27.5" fill="rgba(255,255,255,0.03)" />
          <path d="M 35 27.5 Q 45 15, 55 27.5 T 75 27.5 T 95 27.5 T 115 27.5" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" />
        </g>
      </svg>
      
      {/* Subtle glowing orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '20%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(217, 119, 87, 0.05) 0%, rgba(217, 119, 87, 0) 70%)',
        filter: 'blur(60px)',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        right: '10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 70%)',
        filter: 'blur(60px)',
        borderRadius: '50%'
      }} />
    </div>
  );
}
