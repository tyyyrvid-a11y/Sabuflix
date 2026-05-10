"use client";

import { useEffect, useState, useRef } from "react";
import { getTrending, getImageUrl } from "@/lib/tmdb";
import SaveToPlaylist from "./SaveToPlaylist";
import AdultCensor from "./AdultCensor";
import RatingBadge from "./RatingBadge";

export default function Top10Row({ setHeroItem, openPlayer }) {
  const scrollRef = useRef(null);
  const [items, setItems] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchTop10 = async () => {
      const data = await getTrending('all', 'day');
      if (active && data && data.results) {
        setItems(data.results.slice(0, 10));
      }
    };
    fetchTop10();
    return () => { active = false; };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: '3rem', width: '100%', position: 'relative' }}>
      <h3 style={{
        fontSize: '1.3rem',
        fontWeight: 600,
        marginBottom: '1.2rem',
        color: '#fff',
        fontFamily: 'var(--font-title)',
        letterSpacing: '-0.02em',
        paddingLeft: 'var(--spacing-px)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ color: '#ff3b30' }}>🔥</span> Top 10 Brasil Hoje
      </h3>
      
      <div 
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          padding: '1rem var(--spacing-px) 2rem var(--spacing-px)',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="no-scrollbar"
      >
        {items.map((item, idx) => (
          <div 
            key={`${item.id}-${idx}`}
            onMouseEnter={() => {
              setHeroItem(item);
              setHoveredId(item.id);
            }}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              flex: '0 0 var(--card-width)',
              width: 'var(--card-width)',
              aspectRatio: '2/3',
              position: 'relative',
              cursor: 'pointer',
              animationDelay: `${0.1 + (idx * 0.05)}s`,
              display: 'flex',
              alignItems: 'center',
              zIndex: hoveredId === item.id ? 10 : 1
            }}
            className="animate-fade-in-up"
          >
            {/* The giant glassmorphic number */}
            <div style={{
              position: 'absolute',
              left: '-1.5rem',
              bottom: '-1rem',
              fontSize: '10rem',
              fontWeight: 900,
              fontFamily: 'var(--font-title)',
              lineHeight: 0.8,
              color: 'rgba(255, 255, 255, 0.4)',
              textShadow: '2px 2px 0 #000, -1px -1px 0 rgba(255,255,255,0.2)',
              WebkitTextStroke: '2px rgba(255,255,255,0.8)',
              zIndex: 4,
              pointerEvents: 'none'
            }}>
              {idx + 1}
            </div>

            {/* The actual poster card */}
            <div 
              className="glass-panel apple-card-hover"
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                borderRadius: 'var(--radius-apple)',
                overflow: 'hidden',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: hoveredId === item.id ? '0 15px 40px rgba(0,0,0,0.8)' : '0 4px 15px rgba(0,0,0,0.4)',
                transform: hoveredId === item.id ? 'scale(1.04)' : 'scale(1)',
                zIndex: 3
              }}
            >
              <img 
                src={getImageUrl(item.poster_path, 'w500')} 
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
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                padding: '2rem 1rem 1rem',
                opacity: hoveredId === item.id ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {item.title || item.name}
                </h4>
              </div>

              {hoveredId === item.id && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    right: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
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
                      padding: '0.5rem',
                      borderRadius: '100px',
                      border: 'none',
                      background: '#fff',
                      color: '#000',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    ▶ Assistir
                  </button>
                  <SaveToPlaylist 
                    item={{
                      id: item.id,
                      title: item.title || item.name,
                      media_type: item.media_type || (item.title ? 'movie' : 'tv'),
                      poster_path: item.poster_path,
                      backdrop_path: item.backdrop_path,
                      vote_average: item.vote_average,
                      overview: item.overview
                    }} 
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
