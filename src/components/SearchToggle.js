"use client";

export default function SearchToggle({ mode, setMode }) {
  return (
    <>
      {/* Desktop Segmented Control */}
      <div className="nav-header-desktop animate-fade-in-up segmented-nav-container" style={{
        marginTop: '-1rem',
        marginBottom: '2.5rem',
        width: 'fit-content',
        position: 'relative',
        zIndex: 40
      }}>
        <button 
          onClick={() => setMode('foryou')}
          style={{
            background: mode === 'foryou' ? 'rgba(255,255,255,1)' : 'transparent',
            border: 'none',
            color: mode === 'foryou' ? '#000' : 'rgba(255,255,255,0.7)',
            padding: '0.4rem 1.5rem',
            borderRadius: '100px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            fontSize: '0.9rem',
            textShadow: mode === 'foryou' ? 'none' : '0 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          Início
        </button>
        <button 
          onClick={() => setMode('search')}
          style={{
            background: mode === 'search' ? 'rgba(255,255,255,1)' : 'transparent',
            border: 'none',
            color: mode === 'search' ? '#000' : 'rgba(255,255,255,0.7)',
            padding: '0.4rem 1.5rem',
            borderRadius: '100px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            fontSize: '0.9rem',
            textShadow: mode === 'search' ? 'none' : '0 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          Pesquisa
        </button>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="bottom-tab-bar animate-fade-in-up">
        <button 
          onClick={() => setMode('foryou')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: mode === 'foryou' ? '#fff' : 'rgba(255,255,255,0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            transition: 'all 0.3s ease'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={mode === 'foryou' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Início</span>
        </button>
        <button 
          onClick={() => setMode('search')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: mode === 'search' ? '#fff' : 'rgba(255,255,255,0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            transition: 'all 0.3s ease'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={mode === 'search' ? "3" : "2"} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Pesquisa</span>
        </button>
        {/* Placeholder for future playlist button if we want to migrate it here fully */}
      </div>
    </>
  );
}
