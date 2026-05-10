"use client";

import { useState, useEffect } from "react";
import { getTVSeasons, getTVSeasonEpisodes, getImageUrl, getExternalIds, getMovieDetails } from "@/lib/tmdb";
import { useProfile } from "@/lib/ProfileContext";
import { supabase } from "@/lib/supabase";
import { hapticFeedback } from "@/lib/haptics";
import Image from "next/image";

export default function PlayerOverlay({ item, onClose }) {
  const [isActivated, setIsActivated] = useState(false);
  const [provider, setProvider] = useState('superflix');
  const { activeProfile } = useProfile() || {};
  
  const type = item.media_type || (item.title ? 'movie' : 'tv');
  const tmdbId = item.id;
  const [fullOverview, setFullOverview] = useState(item.overview || "Carregando sinopse...");

  // TV States
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null); // The episode object currently playing
  const [selectedEpisodeNum, setSelectedEpisodeNum] = useState(1);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Torrentio States
  const [imdbId, setImdbId] = useState(null);
  const [torrents, setTorrents] = useState([]);
  const [showTorrents, setShowTorrents] = useState(false);
  const [loadingTorrents, setLoadingTorrents] = useState(false);
  const [torrentError, setTorrentError] = useState(null);
  
  useEffect(() => {
    const fetchExternalIds = async () => {
      const data = await getExternalIds(tmdbId, type);
      if (data && data.imdb_id) setImdbId(data.imdb_id);
    };
    fetchExternalIds();
  }, [tmdbId, type]);

  useEffect(() => {
    // Reset torrents when episode changes
    setTorrents([]);
  }, [selectedEpisodeNum, selectedSeason]);

  const fetchTorrents = async () => {
    if (!imdbId) return;
    setLoadingTorrents(true);
    setTorrentError(null);
    
    try {
      // Fetch base streams without language lock so we can filter locally
      const url = type === 'movie' 
        ? `https://torrentio.strem.fun/stream/movie/${imdbId}.json`
        : `https://torrentio.strem.fun/stream/series/${imdbId}:${selectedSeason}:${selectedEpisodeNum}.json`;
        
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Servidor do Torrentio retornou erro ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.streams && data.streams.length > 0) {
        setTorrents(data.streams);
      } else {
        setTorrentError("Nenhum torrent encontrado para esta seleção.");
      }
    } catch(err) {
      console.error("Torrentio Fetch Error:", err);
      setTorrentError("Erro ao buscar torrents: " + err.message);
    }
    setLoadingTorrents(false);
  };

  useEffect(() => {
    if (type === 'tv') {
      const fetchSeriesData = async () => {
        const seriesData = await getTVSeasons(tmdbId);
        if (seriesData && seriesData.seasons) {
          if (seriesData.overview) setFullOverview(seriesData.overview);
          const validSeasons = seriesData.seasons.filter(s => s.season_number > 0);
          setSeasons(validSeasons);
          
          if (validSeasons.length > 0) {
            handleSeasonChange(validSeasons[0].season_number, true);
          }
        }
      };
      fetchSeriesData();
    } else {
      const fetchMovieData = async () => {
        const movieData = await getMovieDetails(tmdbId);
        if (movieData && movieData.overview) {
          setFullOverview(movieData.overview);
        } else if (movieData && !movieData.overview) {
          setFullOverview("Sinopse não disponível.");
        }
      };
      fetchMovieData();
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
    if (!isInitialLoad) hapticFeedback.light();
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
    hapticFeedback.medium();
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
      if (provider === 'superflix') return `https://superflixapi.rest/filme/${tmdbId}`;
      if (provider === 'betterflix') return `https://betterflix.click/api/player?id=${tmdbId}&type=movie`;
      return `https://warezcdn.site/filme/${tmdbId}`;
    } else {
      if (provider === 'superflix') return `https://superflixapi.rest/serie/${tmdbId}/${selectedSeason}/${selectedEpisodeNum}`;
      if (provider === 'betterflix') return `https://betterflix.click/api/player?id=${tmdbId}&season=${selectedSeason}&episode=${selectedEpisodeNum}&type=tv`;
      return `https://warezcdn.site/serie/${tmdbId}/${selectedSeason}/${selectedEpisodeNum}`;
    }
  };

  const iframeUrl = getIframeUrl();

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#1e1d1b',
      zIndex: 99999,
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* Player Section */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0',
        position: 'relative'
      }}>

        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          marginTop: '0',
          borderRadius: '0',
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
                hapticFeedback.heavy();
                setIsActivated(true);
                requestLandscape();
              }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to bottom, #2c2a28 0%, #1e1d1b 100%)',
                display: 'flex', // Matches Claude Pro background tone
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
                  width: '64px', height: '64px',
                  borderRadius: '16px', // Claude style rounded rectangle
                  background: 'var(--color-accent)', // Terracotta orange
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(217, 119, 87, 0.4)',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, margin: 0, fontFamily: 'var(--font-title)' }}>
                  {type === 'tv' && currentEpisode ? `Reproduzir T${selectedSeason}:E${selectedEpisodeNum}` : 'Reproduzir'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '300px', margin: 0 }}>
                  Preparando vídeo. Clique para iniciar a transmissão imersiva.
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setProvider('superflix')} style={{ padding: '0.5rem 1.2rem', borderRadius: '10px', border: '1px solid ' + (provider === 'superflix' ? 'rgba(255,255,255,0.2)' : 'transparent'), background: provider === 'superflix' ? 'rgba(255,255,255,0.1)' : 'transparent', color: provider === 'superflix' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s' }}>Superflix</button>
                      <button onClick={() => setProvider('warezcdn')} style={{ padding: '0.5rem 1.2rem', borderRadius: '10px', border: '1px solid ' + (provider === 'warezcdn' ? 'rgba(255,255,255,0.2)' : 'transparent'), background: provider === 'warezcdn' ? 'rgba(255,255,255,0.1)' : 'transparent', color: provider === 'warezcdn' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s' }}>WarezCDN</button>
                      <button onClick={() => setProvider('betterflix')} style={{ padding: '0.5rem 1.2rem', borderRadius: '10px', border: '1px solid ' + (provider === 'betterflix' ? 'rgba(255,255,255,0.2)' : 'transparent'), background: provider === 'betterflix' ? 'rgba(255,255,255,0.1)' : 'transparent', color: provider === 'betterflix' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s' }}>Betterflix</button>
                  </div>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata & Episodes Section */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '1rem 1rem 6rem' }}>
        
        {/* Title Block */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 600 }}>
            {type === 'tv' ? `Série: ${item.title || item.name}` : 'Filme'}
          </div>
          
          <h1 style={{ color: type === 'tv' ? 'var(--color-accent)' : '#fff', fontSize: '2.5rem', fontWeight: 400, margin: '0.2rem 0', fontFamily: 'var(--font-title)', letterSpacing: '-0.02em' }}>
            {type === 'tv' ? (currentEpisode?.name || `Episódio ${selectedEpisodeNum}`) : (item.title || item.name)}
          </h1>
          
          <div style={{ display: 'flex', gap: '0.8rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1rem' }}>
            {type === 'tv' && <span>T{selectedSeason}:E{selectedEpisodeNum}</span>}
            <span>•</span>
            <span>{type === 'tv' && currentEpisode ? currentEpisode.air_date : (item.release_date || item.first_air_date)}</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '900px', margin: 0 }}>
            {type === 'tv' && currentEpisode?.overview ? currentEpisode.overview : fullOverview}
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {/* Download Button */}
            <button 
              onClick={() => {
                hapticFeedback.medium();
                setShowTorrents(true);
                if (torrents.length === 0) fetchTorrents();
              }}
              className="apple-card-hover"
              style={{
                background: 'var(--color-accent)',
                border: 'none',
                color: '#000',
                cursor: imdbId ? 'pointer' : 'not-allowed',
                opacity: imdbId ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 8px 24px rgba(217, 119, 87, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Ver Downloads
            </button>

            {/* Back Button */}
            <button 
              onClick={() => {
                hapticFeedback.light();
                onClose();
              }}
              className="glass-panel no-tilt"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 500,
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; }}
            >
              Voltar ao Menu
            </button>
          </div>
        </div>

        {/* TV Show Seasons & Episodes */}
        {type === 'tv' && seasons.length > 0 && (
          <div>
            {/* Season Selector */}
            <div className="no-scrollbar" style={{ 
              display: 'flex', 
              gap: '0.8rem', 
              marginBottom: '2rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem'
            }}>
              {seasons.map(season => (
                <button
                  key={season.season_number}
                  onClick={() => handleSeasonChange(season.season_number)}
                  style={{
                    background: selectedSeason === season.season_number ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: selectedSeason === season.season_number ? '#fff' : 'rgba(255,255,255,0.6)',
                    border: '1px solid ' + (selectedSeason === season.season_number ? 'rgba(255,255,255,0.2)' : 'transparent'),
                    padding: '0.6rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedSeason === season.season_number ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (selectedSeason !== season.season_number) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseOut={(e) => {
                    if (selectedSeason !== season.season_number) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Temporada {season.season_number}
                </button>
              ))}
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
                          <Image 
                            src={getImageUrl(ep.still_path, 'w500')} 
                            alt={ep.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            unoptimized
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
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: isCurrent ? 'var(--color-accent)' : '#fff', fontWeight: 500, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
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
      
      {/* Torrents Modal */}
      {showTorrents && (
        <div 
          onClick={() => setShowTorrents(false)}
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '90%',
              maxWidth: '650px',
              maxHeight: '85vh',
              background: 'rgba(30, 29, 27, 0.95)',
              borderRadius: '24px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, margin: 0, fontFamily: 'var(--font-title)' }}>
                Links de Download via Torrent
              </h2>
              <button 
                onClick={() => setShowTorrents(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >×</button>
            </div>
            
            <div className="no-scrollbar" style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {loadingTorrents ? (
                <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '3rem 0', fontWeight: 500 }}>
                  Buscando fontes no Torrentio...
                </div>
              ) : torrentError ? (
                <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '3rem 0', fontWeight: 500 }}>{torrentError}</div>
              ) : (
                torrents.filter(t => {
                  const sizeMatch = t.title ? t.title.match(/💾\s*([\d.]+)\s*(GB|MB)/) : null;
                  let sizeInGB = 0;
                  if (sizeMatch) {
                    const size = parseFloat(sizeMatch[1]);
                    const unit = sizeMatch[2];
                    sizeInGB = unit === 'GB' ? size : size / 1024;
                  }
                  if (sizeInGB > 5.0) return false;
                  return /🇵🇹|pt-br|dublado|dual áudio|dual/i.test(t.title || '');
                }).map((t, i) => {
                  const parts = t.title ? t.title.split('\n') : [];
                  const filename = parts[0] || t.name;
                  const details = parts[1] || ''; // e.g. '👤 100 💾 6.91 GB ⚙️ YTS'
                  const quality = t.name ? t.name.replace('Torrentio\n', '') : 'Auto';
                  const is4k = quality.toLowerCase().includes('4k');
                  const is1080p = quality.toLowerCase().includes('1080p');
                  
                  let badgeBg = 'rgba(255,255,255,0.15)';
                  let badgeColor = '#fff';
                  let badgeShadow = 'none';

                  if (is4k) {
                    badgeBg = 'var(--color-accent)';
                    badgeColor = '#1e1d1b';
                  } else if (is1080p) {
                    badgeBg = 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)';
                    badgeColor = '#000';
                    badgeShadow = '0 0 10px rgba(212, 175, 55, 0.4)';
                  }
                  
                  const magnetLink = t.infoHash ? `magnet:?xt=urn:btih:${t.infoHash}&dn=${encodeURIComponent(filename)}` : t.url;
                  const webtorLink = `https://webtor.io/show?magnet=${encodeURIComponent(magnetLink)}`;
                  
                  return (
                    <div
                      key={i}
                      className="apple-card-hover"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.2rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px',
                        color: '#fff',
                        transition: 'all 0.2s',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', overflow: 'hidden', flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ 
                            background: badgeBg, 
                            color: badgeColor,
                            boxShadow: badgeShadow,
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '6px', 
                            fontSize: '0.7rem', 
                            fontWeight: 800,
                            letterSpacing: '0.02em'
                          }}>
                            {quality}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {details}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'rgba(255,255,255,0.9)' }}>
                          {filename}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <a 
                          href={magnetLink} 
                          title="Baixar usando um App de Torrent (Ex: qBittorrent)"
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.8rem', 
                            borderRadius: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', 
                            color: '#fff', textDecoration: 'none', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                          App Local
                        </a>
                        <a 
                          href={webtorLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="Baixar pelo navegador (via Webtor.io)"
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.8rem', 
                            borderRadius: '8px', fontSize: '0.8rem', background: 'var(--color-accent)', 
                            color: '#000', textDecoration: 'none', fontWeight: 700,
                            transition: 'opacity 0.2s'
                          }}
                          onMouseOver={e => e.currentTarget.style.opacity = 0.8}
                          onMouseOut={e => e.currentTarget.style.opacity = 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                          Webtor
                        </a>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}