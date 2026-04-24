"use client";

import { useState } from "react";

export default function SearchInput({ mode, onSearch, query }) {
  const [localQuery, setLocalQuery] = useState(query);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      onSearch(localQuery.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 'min(600px, 95vw)', marginBottom: '2rem' }}>
      <div className="glass-panel animate-fade-in-up" style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.4rem 1.5rem',
        borderRadius: '100px',
        animationDelay: '0.1s',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div className="glass-panel-glow" />
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input 
          type="text" 
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={mode === 'search' ? "Busque por uma obra-prima..." : "Explore o universo..."}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.25rem',
            padding: '0.8rem 1rem',
            width: '100%',
            outline: 'none',
            fontFamily: 'var(--font-inter)',
            fontWeight: 400,
            letterSpacing: '-0.01em'
          }}
        />
        <button type="submit" style={{ display: 'none' }}>Search</button>
      </div>
    </form>
  );
}
