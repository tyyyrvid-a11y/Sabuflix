"use client";

import { useState, useEffect } from "react";
import { getTVSeasons, getTVSeasonEpisodes, getImageUrl } from "@/lib/tmdb";
import { useProfile } from "@/lib/ProfileContext";
import { supabase } from "@/lib/supabase";

export default function PlayerOverlay({ item, onClose }) {
  const [isActivated, setIsActivated] = useState(false);
  const [provider, setProvider] = useState('superflix');
  const { activeProfile } = useProfile() || {};
  
  const type = item.media_type || (item.title ? 'movie' : 'tv');
  const tmdbId = item.id;

  // TV States
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null); // The episode object currently playing
  const [selectedEpisodeNum, setSelectedEpisodeNum] = useState(1);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    if (type === 'tv') {
      const fetchSeriesData = async () => {
        const seriesData = await getTVSeasons(tmdbId);
        if (seriesData && seriesData.seasons) {
          const validSeasons = seriesData.seasons.filter(s => s.season_number > 0);
          setSeasons(validSeasons);
          
          if (validSeasons.length > 0) {
            handleSeasonChange(validSeasons[0].season_number, true);
          }
        }
      };
      fetchSeriesData();
    }
  }, [tmdbId, type]);

  useEffect(() => {
    if (isActivated && activeProfile) {
      const saveHistory = async () => {
        const titleToSave = item.title || item.name;
        const payload = {
          profile_id: activeProfile.id,
          tmdb_id: tmdbId,
          media_type: type,
          title: titleToSave,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          progress: type === 'tv' ? selectedEpisodeNum : 1, // Store episode num for TV
          updated_at: new Date().toISOString()
        };

        await supabase
          .from('continue_watching')
          .upsert(payload, { onConflict: 'profile_id, tmdb_id' });
      };
      saveHistory();
    }
  }, [isActivated, activeProfile, tmdbId, type, item, selectedEpisodeNum]);

  const handleSeasonChange = async (seasonNum, isInitialLoad = false) => {
    setSelectedSeason(seasonNum);
    setLoadingEpisodes(true);
    const seasonData = await getTVSeasonEpisodes(tmdbId, seasonNum);
    if (seasonData && seasonData.episodes) {
      setEpisodes(seasonData.episodes);
      if (isInitialLoad && seasonData.episodes.length > 0) {
        setCurrentEpisode(seasonData.episodes[0]);
        setSelectedEpisodeNum(seasonData.episodes[0].episode_number);
      }
    }
    setLoadingEpisodes(false);
  };

  const playEpisode = (episode) => {
    setCurrentEpisode(episode);
    setSelectedEpisodeNum(episode.episode_number);
    setIsActivated(true); // Automatically activate iframe when clicking a new episode
  };

  const requestLandscape = async () => {
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock('landscape');
      } catch (e) {
        console.log('Orientation lock not supported');
      }
    }
  };

  const getIframeUrl = () => {
    if (type === 'movie') {
      return provider === 'superflix'
        ? `https://superflixapi.rest/filme/${tmdbId}`
        : `https://warezcdn.site/filme/${tmdbId}`;
    } else {
      return provider === 'superflix'
        ? `https://superflixapi.rest/serie/${tmdbId}/${selectedSeason}/${selectedEpisodeNum}`
        : `https://warezcdn.site/serie/${tmdbId}/${selectedSeason}/${selectedEpisodeNum}`;
    }
  };

  const iframeUrl = getIframeUrl();

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#0a0a0c', // Apple TV dark bg
      zIndex: 100,
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Player Section */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '2rem auto 1rem',
        padding: '0 1.5rem',
        position: 'relative'
      }}>
        {/* Back Button */}
        <button 
          onClick={onClose}
          className="glass-panel no-tilt"
          style={{
            position: 'absolute',
            top: '0',
            right: '1.5rem',
            zIndex: 110,
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '100px',
            fontWeight: 600,
            fontSize: '0.85rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
        >
          Ir ao menu
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          marginTop: '4rem',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#000',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
        }}>
          {isActivated ? (
            <iframe 
              src={iframeUrl}
              style={{ width: '100%', height: '100%', border: '0' }}
              frameBorder="0" 
              scrolling="no"
              allowFullScreen 
              allow="autoplay; encrypted-media; fullscreen"
            ></iframe>
          ) : (
            <div 
              onClick={() => {
                setIsActivated(true);
                requestLandscape();
              }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to bottom, #161b2e 0%, #0d101a 100%)',
                display: 'flex', // Matches Apple TV background tone
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px', height: '60px',
                  borderRadius: '50%',
                  background: '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
                  marginBottom: '1rem'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, margin: 0, fontFamily: 'var(--font-title)' }}>
                  {type === 'tv' && currentEpisode ? `Reproduzir T${selectedSeason}:E${selectedEpisodeNum}` : 'Reproduzir'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '300px', margin: 0 }}>
                  Preparando vídeo. Clique para iniciar a transmissão imersiva.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '100px' }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setProvider('superflix')} style={{ padding: '0.4rem 1rem', borderRadius: '100px', border: 'none', background: provider === 'superflix' ? 'rgba(255,255,255,0.1)' : 'transparent', color: provider === 'superflix' ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem' }}>Superflix</button>
                    <button onClick={() => setProvider('warezcdn')} style={{ padding: '0.4rem 1rem', borderRadius: '100px', border: 'none', background: provider === 'warezcdn' ? 'rgba(255,255,255,0.1)' : 'transparent', color: provider === 'warezcdn' ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem' }}>WarezCDN</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata & Episodes Section */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem 4rem' }}>
        
        {/* Title Block */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 600 }}>
            {type === 'tv' ? `Série: ${item.title || item.name}` : 'Filme'}
          </div>
          
          <h1 style={{ color: type === 'tv' ? '#ff3b30' : '#fff', fontSize: '2.2rem', fontWeight: 700, margin: '0.2rem 0', fontFamily: 'var(--font-title)', letterSpacing: '-0.5px' }}>
            {type === 'tv' ? (currentEpisode?.name || `Episódio ${selectedEpisodeNum}`) : (item.title || item.name)}
          </h1>
          
          <div style={{ display: 'flex', gap: '0.8rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1rem' }}>
            {type === 'tv' && <span>T{selectedSeason}:E{selectedEpisodeNum}</span>}
            <span>•</span>
            <span>{type === 'tv' && currentEpisode ? currentEpisode.air_date : (item.release_date || item.first_air_date)}</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '900px', margin: 0 }}>
            {type === 'tv' && currentEpisode?.overview ? currentEpisode.overview : item.overview}
          </p>
        </div>

        {/* TV Show Seasons & Episodes */}
        {type === 'tv' && seasons.length > 0 && (
          <div>
            {/* Season Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <select 
                value={selectedSeason}
                onChange={(e) => handleSeasonChange(Number(e.target.value))}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#ff3b30',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.7rem 1.2rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                  appearance: 'none',
                  WebkitAppearance: 'none'
                }}
              >
                {seasons.map(season => (
                  <option key={season.season_number} value={season.season_number} style={{ background: '#111', color: '#fff' }}>
                    Temporada {season.season_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Episodes Carousel */}
            {loadingEpisodes ? (
               <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem 0' }}>Carregando episódios...</div>
            ) : (
              <div 
                className="no-scrollbar"
                style={{
                  display: 'flex',
                  gap: '1.2rem',
                  overflowX: 'auto',
                  paddingBottom: '2rem',
                  scrollBehavior: 'smooth'
                }}
              >
                {episodes.map((ep) => {
                  const isCurrent = ep.episode_number === selectedEpisodeNum;
                  return (
                    <div 
                      key={ep.id}
                      onClick={() => playEpisode(ep)}
                      className="apple-card-hover"
                      style={{
                        flex: '0 0 280px',
                        width: '280px',
                        cursor: 'pointer',
                        opacity: isCurrent ? 1 : 0.6,
                        transform: isCurrent ? 'translateY(-4px)' : 'translateY(0)',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.opacity = 1;
                        if (!isCurrent) e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseOut={(e) => {
                        if(!isCurrent) {
                          e.currentTarget.style.opacity = 0.6;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <div style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#1a1a24',
                        boxShadow: isCurrent 
                          ? '0 0 0 3px rgba(255,255,255,0.95), 0 15px 35px rgba(255,255,255,0.15), 0 4px 15px rgba(0,0,0,0.8)' 
                          : '0 4px 12px rgba(0,0,0,0.5)',
                        transition: 'box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}>
                        {ep.still_path ? (
                          <img 
                            src={getImageUrl(ep.still_path, 'w500')} 
                            alt={ep.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                           <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                             S/ Foto
                           </div>
                        )}
                        <div style={{
                          position: 'absolute',
                          bottom: '0.5rem',
                          left: '0.5rem',
                          background: 'rgba(0,0,0,0.8)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                           DUB/LEG
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '0.75rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: isCurrent ? '#ff3b30' : '#fff', fontWeight: 600, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span>T{ep.season_number}:E{ep.episode_number}</span>
                          <span style={{ color: isCurrent ? '#fff' : 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ep.name}</span>
                        </h4>
                        <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {ep.overview || "Sem descrição disponível."}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}