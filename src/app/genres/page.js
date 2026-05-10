"use client";

import { useEffect, useState } from "react";
import { getGenres, getDiscover, getImageUrl } from "@/lib/tmdb";
import PlayerOverlay from "@/components/PlayerOverlay";
import AdultCensor from "@/components/AdultCensor";

export default function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [playerItem, setPlayerItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInit = async () => {
      const data = await getGenres('movie');
      if (data && data.genres) {
        setGenres(data.genres);
      }
      setLoading(false);
    };
    fetchInit();
  }, []);

  const handleSelectGenre = async (genre) => {
    setSelectedGenre(genre);
    setMovies([]);
    const data = await getDiscover('movie', { with_genres: genre.id, sort_by: 'popularity.desc' });
    if (data && data.results) {
      setMovies(data.results);
    }
  };

  if (loading) return <div style={{ paddingTop: '100px', textAlign: 'center', color: '#fff' }}>Carregando gêneros...</div>;

  return (
    <main style={{ minHeight: '100vh', padding: '100px var(--spacing-px) 4rem', background: '#0a0a0c' }}>
      <h1 style={{ color: '#fff', fontSize: '2.5rem', fontFamily: 'var(--font-title)', marginBottom: '2rem' }}>Explorar Gêneros</h1>
      
      {!selectedGenre ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {genres.map(genre => (
            <div 
              key={genre.id}
              onClick={() => handleSelectGenre(genre)}
              className="glass-panel"
              style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.05)',
                transition: 'all 0.3s ease',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
              }}
            >
              {genre.name}
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-fade-in">
          <button 
            onClick={() => setSelectedGenre(null)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '100px',
              cursor: 'pointer',
              marginBottom: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 500,
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Voltar aos gêneros
          </button>
          
          <h2 style={{ color: '#fff', marginBottom: '2rem', fontFamily: 'var(--font-title)' }}>
            Destaques em {selectedGenre.name}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(var(--card-width), 1fr))', gap: '1.5rem' }}>
            {movies.map(movie => (
              <div 
                key={movie.id}
                onClick={() => setPlayerItem(movie)}
                className="apple-card-hover animate-fade-in-up"
                style={{ cursor: 'pointer', borderRadius: 'var(--radius-apple)', overflow: 'hidden', aspectRatio: '2/3', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
              >
                <img src={getImageUrl(movie.poster_path, 'w500')} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <AdultCensor isAdult={movie.adult} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)',
                  padding: '2rem 1rem 1rem',
                }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {movie.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {playerItem && (
        <PlayerOverlay item={playerItem} onClose={() => setPlayerItem(null)} />
      )}
    </main>
  );
}
