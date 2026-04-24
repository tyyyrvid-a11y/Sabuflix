"use client";

import { useEffect, useState } from "react";
import { getPersonCombinedCredits, getImageUrl } from "@/lib/tmdb";
import { fetchWikipediaSummary } from "@/lib/wikipedia";

export default function BiographyModal({ person, onClose, openPlayer }) {
  const [wiki, setWiki] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchBioData = async () => {
      setLoading(true);
      
      const [wikiData, creditsData] = await Promise.all([
        fetchWikipediaSummary(person.name),
        getPersonCombinedCredits(person.id)
      ]);

      if (active) {
        setWiki(wikiData);
        
        let allCredits = [];
        if (creditsData) {
          allCredits = [...(creditsData.cast || []), ...(creditsData.crew || [])];
          
          // Filter unique and sort chronological (newest first)
          const uniqueMap = new Map();
          for (const c of allCredits) {
            if (c.poster_path && !uniqueMap.has(c.id)) {
              // Try to get a date
              const d = c.release_date || c.first_air_date || '';
              uniqueMap.set(c.id, { ...c, sortDate: d });
            }
          }
          
          const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
            return b.sortDate.localeCompare(a.sortDate);
          });

          setCredits(sorted);
        }
        setLoading(false);
      }
    };

    fetchBioData();

    return () => { active = false; };
  }, [person.id, person.name]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 50,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem',
          padding: '0.8rem 1.6rem',
          borderRadius: '50px',
          fontWeight: 600,
          fontFamily: 'var(--font-inter)',
          letterSpacing: '1px',
          zIndex: 60
        }}
        className="glass-panel"
      >
        <div className="glass-panel-glow" />
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        FECHAR
      </button>

      {loading ? (
        <div style={{ color: '#fff' }}>Carregando biografia...</div>
      ) : (
        <div className="animate-fade-in-up glass-panel" style={{
          width: '100%',
          maxWidth: '1200px',
          height: 'min(90vh, 100%)',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          borderRadius: '30px',
          overflowY: 'auto',
          background: 'rgba(15,15,15,0.85)',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
        }}>
          <div className="glass-panel-glow" />
          {/* Left Column (Bio) */}
          <div style={{
            flex: '1 1 400px',
            padding: 'min(4rem, 8%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            minHeight: 'min-content'
          }}>
            <img 
              src={getImageUrl(person.profile_path, 'h632')} 
              alt={person.name}
              style={{
                width: '100%',
                maxHeight: '500px',
                objectFit: 'cover',
                borderRadius: '20px',
                marginBottom: '2.5rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}
            />
            <h1 style={{ 
              fontSize: '3rem', 
              marginBottom: '0.75rem', 
              fontWeight: 500,
              fontFamily: 'var(--font-title)',
              letterSpacing: '-0.04em'
            }}>{person.name}</h1>
            <p style={{ 
              color: 'rgba(255,255,255,0.4)', 
              marginBottom: '3rem', 
              textTransform: 'uppercase', 
              letterSpacing: '3px', 
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'var(--font-inter)'
            }}>
              {person.known_for_department === 'Acting' ? 'Atuação' : 'Produção/Direção'} • {credits.length} Projetos
            </p>

            {wiki && wiki.extract ? (
              <p style={{ 
                lineHeight: 1.8, 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '1.1rem', 
                textAlign: 'justify',
                fontFamily: 'var(--font-inter)',
                fontWeight: 400
              }}>
                {wiki.extract}
              </p>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>Nenhuma biografia encontrada.</p>
            )}
          </div>

          {/* Right Column (Filmography) */}
          <div style={{
            flex: '1 1 500px',
            padding: 'min(4rem, 8%)',
          }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '2.5rem', 
              fontWeight: 500,
              fontFamily: 'var(--font-title)',
              letterSpacing: '-0.02em'
            }}>Filmografia</h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {credits.map(c => (
                <div 
                  key={c.id}
                  onClick={() => { onClose(); openPlayer(c); }}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <img 
                    src={getImageUrl(c.poster_path, 'w92')} 
                    alt={c.title || c.name}
                    style={{ width: '45px', height: '68px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 500 }}>{c.title || c.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                      {c.sortDate ? c.sortDate.split('-')[0] : 'TBA'} • {c.media_type === 'tv' ? 'Série' : 'Filme'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
