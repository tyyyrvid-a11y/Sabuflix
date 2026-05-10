"use client";

import { useEffect, useState, useRef } from "react";
import { getTrending, getMovieSimilar, getTVSimilar, getDiscover, getImageUrl } from "@/lib/tmdb";
import { supabase } from "@/lib/supabase";
import SaveToPlaylist from "./SaveToPlaylist";
import Top10Row from "./Top10Row";
import AdultCensor from "./AdultCensor";
import RatingBadge from "./RatingBadge";

function RecommendationRow({ title, items, setHeroItem, openPlayer, isFeatured = false }) {
  const scrollRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: '3rem', width: '100%' }}>
      <h3 style={{
        fontSize: '1.3rem',
        fontWeight: 600,
        marginBottom: '1.2rem',
        color: '#fff',
        fontFamily: 'var(--font-title)',
        letterSpacing: '-0.02em',
        paddingLeft: 'var(--spacing-px)'
      }}>
        {title}
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
            className="glass-panel apple-card-hover animate-fade-in-up"
            style={{
              flex: isFeatured ? '0 0 calc(var(--card-width) * 1.8)' : '0 0 var(--card-width)',
              width: isFeatured ? 'calc(var(--card-width) * 1.8)' : 'var(--card-width)',
              aspectRatio: isFeatured ? '16/9' : '2/3',
              padding: '0',
              cursor: 'pointer',
              animationDelay: `${0.1 + (idx * 0.05)}s`,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              borderRadius: isFeatured ? '16px' : 'var(--radius-apple)',
              overflow: 'hidden',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: hoveredId === item.id ? '0 15px 40px rgba(0,0,0,0.8)' : '0 4px 15px rgba(0,0,0,0.4)',
              zIndex: hoveredId === item.id ? 10 : 1
            }}
          >
            <div className="glass-panel-glow" />
            <img 
              src={getImageUrl(isFeatured ? (item.backdrop_path || item.poster_path) : item.poster_path, 'w500')} 
              alt={item.title || item.name} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#111',
                transform: hoveredId === item.id ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
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
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
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
        ))}
      </div>
    </div>
  );
}

const ALL_CATEGORIES = [
  { title: 'TIRO PRA TODO QUE É LADO', type: 'movie', params: { with_genres: '28' } },
  { title: 'Novos Mundos', type: 'movie', params: { with_genres: '878,14' } },
  { title: 'Desenhos e Animações', type: 'movie', params: { with_genres: '16' } },
  { title: 'Rir Para Não Chorar', type: 'movie', params: { with_genres: '35' } },
  { title: 'Terror Para Não Dormir', type: 'movie', params: { with_genres: '27' } },
  { title: 'Mistérios Intrigantes', type: 'movie', params: { with_genres: '9648' } },
  { title: 'Romances Inesquecíveis', type: 'movie', params: { with_genres: '10749' } },
  { title: 'Crimes e Investigação', type: 'movie', params: { with_genres: '80' } },
  { title: 'Baseado em Fatos Reais', type: 'movie', params: { with_genres: '36' } },
  { title: 'Aventuras Épicas', type: 'movie', params: { with_genres: '12' } },
  { title: 'A Magia do Cinema', type: 'movie', params: { with_genres: '14' } },
  { title: 'Música para os Ouvidos', type: 'movie', params: { with_genres: '10402' } },
  { title: 'Para Assistir em Família', type: 'movie', params: { with_genres: '10751' } },
  { title: 'Documentários Chocantes', type: 'movie', params: { with_genres: '99' } },
  { title: 'Velho Oeste', type: 'movie', params: { with_genres: '37' } },
  { title: 'Tensão Máxima', type: 'movie', params: { with_genres: '53' } },
  { title: 'Dramas Profundos', type: 'movie', params: { with_genres: '18' } },
  { title: 'Guerra e História', type: 'movie', params: { with_genres: '10752' } },
  { title: 'Aura dos Anos 80', type: 'movie', params: { 'primary_release_date.gte': '1980-01-01', 'primary_release_date.lte': '1989-12-31' } },
  { title: 'Nostalgia Anos 90', type: 'movie', params: { 'primary_release_date.gte': '1990-01-01', 'primary_release_date.lte': '1999-12-31' } },
  { title: 'Lançamentos', type: 'movie', params: { 'primary_release_date.gte': '2023-01-01' } },
  { title: 'Clássicos do Cinema', type: 'movie', params: { 'primary_release_date.lte': '1979-12-31', 'vote_average.gte': 7.5 } },
  { title: 'Ação e Aventura', type: 'movie', params: { with_genres: '28,12' } },
  { title: 'Comédia Romântica', type: 'movie', params: { with_genres: '35,10749' } },
  { title: 'Ficção e Terror', type: 'movie', params: { with_genres: '878,27' } },
  { title: 'Obras Primas Ocultas', type: 'movie', params: { 'vote_average.gte': 8, 'vote_count.lte': 1500, 'vote_count.gte': 100 } },
  { title: 'Suspense Psicológico', type: 'movie', params: { with_genres: '53,9648' } },
  { title: 'Maratonar no Fim de Semana', type: 'tv', params: { with_genres: '18' } },
  { title: 'Séries de Comédia', type: 'tv', params: { with_genres: '35' } },
  { title: 'Séries de Ação', type: 'tv', params: { with_genres: '10759' } },
  { title: 'Séries de Fantasia e Sci-Fi', type: 'tv', params: { with_genres: '10765' } },
  { title: 'Animes Inesquecíveis', type: 'tv', params: { with_genres: '16', with_original_language: 'ja' } },
  { title: 'Dramas Envolventes', type: 'tv', params: { with_genres: '10766' } },
  { title: 'Artes Marciais', type: 'movie', params: { with_genres: '28', with_keywords: '779' } },
  { title: 'Exploração Espacial', type: 'movie', params: { with_genres: '878', with_keywords: '3386' } },
  { title: 'Apocalipse Zumbi', type: 'movie', params: { with_genres: '27', with_keywords: '12377' } },
  { title: 'Viagem no Tempo', type: 'movie', params: { with_genres: '878', with_keywords: '4379' } },
  { title: 'Mundo dos Vampiros', type: 'movie', params: { with_genres: '27', with_keywords: '3133' } },
  { title: 'Futuro Distópico', type: 'movie', params: { with_genres: '878', with_keywords: '4565' } },
  { title: 'Heróis e Vilões', type: 'movie', params: { with_genres: '28', with_keywords: '9715' } },
];

export default function ForYou({ setHeroItem, openPlayer }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchAllData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      let lastItem = null;
      
      if (user) {
        const { data: playlists } = await supabase.from("playlists").select("id").eq("user_id", user.id).limit(1);
        if (playlists && playlists.length > 0) {
          const { data: items } = await supabase.from("playlist_items").select("*").eq("playlist_id", playlists[0].id).order("created_at", { ascending: false }).limit(1);
          if (items && items.length > 0) lastItem = items[0];
        }
      }

      // Pick 5 items total. If we have a lastItem, we need 4 more categories. Else 5.
      const neededCategoriesCount = lastItem ? 4 : 5;
      
      // Shuffle ALL_CATEGORIES and pick
      const shuffledCategories = [...ALL_CATEGORIES].sort(() => 0.5 - Math.random());
      const selectedCategories = shuffledCategories.slice(0, neededCategoriesCount);

      // Create promises
      const promises = selectedCategories.map(cat => 
        getDiscover(cat.type, { ...cat.params, sort_by: 'popularity.desc' })
      );

      if (lastItem) {
        promises.unshift(lastItem.media_type === 'tv' ? getTVSimilar(lastItem.tmdb_id) : getMovieSimilar(lastItem.tmdb_id));
      }

      const results = await Promise.all(promises);
      
      if (active) {
        const newSections = [];
        let resultIndex = 0;

        if (lastItem) {
          const similarResult = results[0];
          if (similarResult && similarResult.results && similarResult.results.length > 0) {
            newSections.push({
              title: `Porque você assistiu ${lastItem.title}`,
              items: similarResult.results.slice(0, 15)
            });
          }
          resultIndex = 1;
        }

        selectedCategories.forEach((cat) => {
          const catResult = results[resultIndex];
          if (catResult && catResult.results && catResult.results.length > 0) {
            newSections.push({
              title: cat.title,
              items: catResult.results.slice(0, 15)
            });
          }
          resultIndex++;
        });

        setSections(newSections);
        
        // Set initial hero item from the first item of the first section
        const firstValidItem = newSections.find(s => s.items && s.items.length > 0)?.items[0];
        if (firstValidItem) setHeroItem(firstValidItem);
        
        setLoading(false);
      }
    };

    fetchAllData();
    return () => { active = false; };
  }, [setHeroItem]);

  if (loading) {
    return <div className="animate-fade-in" style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '4rem' }}>Processando algoritmos de recomendação...</div>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', paddingTop: '2rem' }}>
      <Top10Row setHeroItem={setHeroItem} openPlayer={openPlayer} />
      {sections.map((section, idx) => (
        <RecommendationRow 
          key={idx}
          title={section.title}
          items={section.items}
          setHeroItem={setHeroItem}
          openPlayer={openPlayer}
          isFeatured={idx === 0} // Make the first row 16:9 featured
        />
      ))}
    </div>
  );
}
