"use client";

import { useEffect, useState } from "react";
import { searchMulti, getMovieSimilar, getTVSimilar, getPersonCombinedCredits, getImageUrl } from "@/lib/tmdb";
import SaveToPlaylist from "./SaveToPlaylist";
import AdultCensor from "./AdultCensor";
import RatingBadge from "./RatingBadge";

export default function SmartSearch({ query, setBackdrop, openPlayer, openBiography }) {
  const [highlightResults, setHighlightResults] = useState([]);
  const [otherResults, setOtherResults] = useState([]);
  const [personLink, setPersonLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchSmart = async () => {
      setLoading(true);
      setHighlightResults([]);
      setOtherResults([]);
      setPersonLink(null);

      const multisearch = await searchMulti(query);
      if (!multisearch || !multisearch.results || multisearch.results.length === 0) {
        if (active) setLoading(false);
        return;
      }

      const validResults = multisearch.results.filter(r => r.poster_path || r.profile_path);
      if (validResults.length === 0) {
        if (active) setLoading(false);
        return;
      }

      const topMatch = validResults[0];
      const remaining = validResults.slice(1);

      if (topMatch.media_type === "person") {
        if (active) setPersonLink(topMatch);
        const credits = await getPersonCombinedCredits(topMatch.id);
        if (credits && credits.cast) {
          const workingCredits = topMatch.known_for_department === "Acting" ? credits.cast : credits.crew.filter(c => c.department === topMatch.known_for_department);
          const sorted = workingCredits
            .filter(c => c.media_type === "movie" && c.poster_path && c.backdrop_path)
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 3);
            
          if (active) {
            setHighlightResults(sorted);
            setOtherResults(remaining);
            if (sorted.length > 0) setBackdrop(sorted[0].backdrop_path);
          }
        }
      } else if (topMatch.media_type === "movie") {
        const similar = await getMovieSimilar(topMatch.id);
        const simList = (similar && similar.results) 
            ? similar.results.filter(m => m.poster_path && m.backdrop_path).slice(0, 2) 
            : [];
            
        if (active) {
          setHighlightResults([topMatch, ...simList]);
          setOtherResults(remaining);
          setBackdrop(topMatch.backdrop_path);
        }
      } else if (topMatch.media_type === "tv") {
        const similar = await getTVSimilar(topMatch.id);
        const simList = (similar && similar.results) 
            ? similar.results.filter(m => m.poster_path && m.backdrop_path).slice(0, 2) 
            : [];

        if (active) {
          setHighlightResults([topMatch, ...simList]);
          setOtherResults(remaining);
          setBackdrop(topMatch.backdrop_path);
        }
      }

      if (active) setLoading(false);
    };

    fetchSmart();

    return () => { active = false; };
  }, [query, setBackdrop]);

  if (loading) {
    return <div className="animate-fade-in" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>Pesquisando no universo...</div>;
  }

  if (highlightResults.length === 0 && otherResults.length === 0) {
    return <div className="animate-fade-in" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>Nenhum resultado encontrado.</div>;
  }

  const renderItem = (item, idx, isLarge = false) => (
    <div 
      key={`${item.id}-${idx}`}
      onMouseEnter={() => {
        if (item.backdrop_path) setBackdrop(item.backdrop_path);
        setHoveredId(item.id);
      }}
      onMouseLeave={() => setHoveredId(null)}
      className="glass-panel apple-card-hover animate-fade-in-up"
      style={{
        width: '100%',
        maxWidth: isLarge ? 'var(--card-width-large)' : 'var(--card-width)',
        aspectRatio: '2/3',
        cursor: 'pointer',
        animationDelay: `${0.1 + (idx * 0.05)}s`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: isLarge ? '24px' : '16px',
        overflow: 'hidden',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div className="glass-panel-glow" />
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
        <img 
          src={getImageUrl(item.poster_path || item.profile_path, 'w500')} 
          alt={item.title || item.name} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#111'
          }}
        />
        
        <RatingBadge item={item} />
        <AdultCensor isAdult={item.adult} />
        
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
          padding: '2rem 1rem 1rem',
          opacity: hoveredId === item.id ? 1 : 0,
          transition: 'opacity 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'none'
        }}>
          <h3 style={{ margin: 0, fontSize: isLarge ? '1.1rem' : '0.9rem', fontWeight: 600, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {item.title || item.name}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
             {item.release_date ? item.release_date.split('-')[0] : ''}
             {item.first_air_date ? item.first_air_date.split('-')[0] : ''}
             {' • '}
             {item.media_type === 'movie' ? 'Filme' : item.media_type === 'tv' ? 'Série' : 'Pessoa'}
          </span>
        </div>
      </div>
      
      {hoveredId === item.id && item.media_type !== "person" && (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            display: 'flex',
            flexDirection: isLarge ? 'column' : 'row',
            gap: '0.5rem',
            zIndex: 10
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              openPlayer(item);
            }}
            className="glass-panel"
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '100px',
              border: 'none',
              background: '#fff',
              color: '#000',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            ▶ Assistir
          </button>
          <div style={{ flex: isLarge ? 'none' : 1 }}>
            <SaveToPlaylist 
              item={{
                id: item.id,
                title: item.title || item.name,
                media_type: item.media_type,
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                vote_average: item.vote_average,
                overview: item.overview
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem' }}>
      
      {/* Best Matches / Highlight Section */}
      {highlightResults.length > 0 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {personLink && (
            <button
              onClick={() => openBiography(personLink)}
              className="glass-panel animate-fade-in-up"
              style={{
                background: 'transparent',
                padding: '1rem 2rem',
                marginBottom: '2rem',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '1rem',
                animationDelay: '0.2s',
                borderRadius: '100px'
              }}
            >
              Quem é {personLink.name}? <span style={{ opacity: 0.5, marginLeft: '0.5rem' }}>Ler Biografia</span>
            </button>
          )}

          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            width: '100%'
          }}>
            {highlightResults.map((item, idx) => renderItem(item, idx, true))}
          </div>
        </div>
      )}

      {/* Other Results Section */}
      {otherResults.length > 0 && (
        <div style={{ width: '100%' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 500,
            marginBottom: '1.5rem',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'var(--font-inter)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '0.5rem'
          }}>
            Mais Resultados
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(var(--card-width), 1fr))',
            gap: '1.5rem',
            width: '100%'
          }}>
            {otherResults.map((item, idx) => renderItem(item, idx, false))}
          </div>
        </div>
      )}
    </div>
  );
}
