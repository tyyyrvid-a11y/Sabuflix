"use client";

import { useState, useCallback } from "react";
import { getTrending } from "@/lib/tmdb";
import HeroBackground from "@/components/HeroBackground";
import SearchToggle from "@/components/SearchToggle";
import SearchInput from "@/components/SearchInput";
import SmartSearch from "@/components/SmartSearch";
import ForYou from "@/components/ForYou";
import PlayerOverlay from "@/components/PlayerOverlay";
import BiographyModal from "@/components/BiographyModal";
import ContinueWatching from "@/components/ContinueWatching";
import { hapticFeedback } from "@/lib/haptics";
import ClaudeBubbles from "@/components/ClaudeBubbles";

export default function Home() {
  const [mode, setMode] = useState("foryou"); // 'search' or 'foryou'
  const [query, setQuery] = useState("");
  const [heroItem, setHeroItem] = useState(null);
  
  // Modals state
  const [playerItem, setPlayerItem] = useState(null); // The TMDB item to play
  const [biographyPerson, setBiographyPerson] = useState(null); // The TMDB person to view

  const handleSearch = (q) => {
    setQuery(q);
  };

  const clearSearch = () => {
    setQuery("");
  };

  const handleSetBackdrop = useCallback((url) => {
    setHeroItem((prev) => {
      // Prevent unnecessary state updates to break infinite loops
      if (prev?.backdrop_path === url) return prev;
      return { ...prev, backdrop_path: url };
    });
  }, []);

  const handleSurpriseMe = async () => {
    hapticFeedback.medium();
    const data = await getTrending('all', 'week');
    if (data && data.results && data.results.length > 0) {
      // Pick a random item
      const randomIndex = Math.floor(Math.random() * data.results.length);
      const randomItem = data.results[randomIndex];
      setPlayerItem(randomItem);
    }
  };

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      <ClaudeBubbles />
      {/* Fallback to poster if backdrop is missing */}
      <HeroBackground 
        backdropPath={heroItem?.backdrop_path || heroItem?.poster_path} 
        isAdult={heroItem?.adult}
      />
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '1.5rem var(--spacing-px)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start', /* Changed to left-align */
        paddingTop: mode === 'search' && !query ? '40vh' : '2rem',
        transition: 'padding-top 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <SearchToggle mode={mode} setMode={setMode} />
        </div>

        {/* Hero Info Overlay (Apple TV Style) */}
        {mode === 'foryou' && heroItem && (
          <div className="animate-fade-in" style={{
            marginTop: '10vh',
            marginBottom: '4rem',
            width: '100%',
            maxWidth: '600px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            textShadow: '0 2px 20px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.3)'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
              fontFamily: 'var(--font-title)',
              letterSpacing: '-1px'
            }}>
              {heroItem.title || heroItem.name}
            </h1>
            
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
              <span>{Math.round(heroItem.vote_average * 10)}% Match</span>
              <span>{heroItem.media_type === 'tv' ? 'Série' : 'Filme'}</span>
              {(heroItem.release_date || heroItem.first_air_date) && (
                <span>{(heroItem.release_date || heroItem.first_air_date).substring(0, 4)}</span>
              )}
            </div>

            <p style={{
              fontSize: '1.05rem',
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {heroItem.overview || "Descubra os mistérios deste título."}
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={() => {
                  hapticFeedback.light();
                  setPlayerItem(heroItem);
                }}
                style={{
                  background: '#fff',
                  color: '#1e1d1b',
                  border: 'none',
                  padding: '0.8rem 2.5rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                }}
              >
                ▶ Assistir
              </button>
              


            </div>
          </div>
        )}
        
        {mode === 'foryou' && (
          <ContinueWatching openPlayer={setPlayerItem} />
        )}

        {mode === 'search' && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <SearchInput mode={mode} onSearch={handleSearch} query={query} />
          </div>
        )}

        {mode === 'search' && query && (
          <div style={{ width: '100%' }}>
            <SmartSearch 
              query={query} 
              setBackdrop={handleSetBackdrop} 
              openPlayer={setPlayerItem} 
              openBiography={setBiographyPerson} 
            />
          </div>
        )}

        {mode === 'foryou' && (
          <ForYou 
            setHeroItem={setHeroItem} 
            openPlayer={setPlayerItem} 
          />
        )}

        {mode === 'search' && query && (
          <button 
            onClick={() => {
              hapticFeedback.light();
              clearSearch();
            }}
            className="glass-panel"
            style={{
              marginTop: '4rem',
              padding: '0.75rem 2rem',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Pesquisar Novamente
          </button>
        )}
      </div>

      {playerItem && (
        <PlayerOverlay item={playerItem} onClose={() => setPlayerItem(null)} />
      )}

      {biographyPerson && (
        <BiographyModal person={biographyPerson} onClose={() => setBiographyPerson(null)} openPlayer={setPlayerItem} />
      )}
    </main>
  );
}
