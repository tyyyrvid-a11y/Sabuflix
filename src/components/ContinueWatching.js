"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/lib/ProfileContext";
import { getImageUrl } from "@/lib/tmdb";
import { hapticFeedback } from "@/lib/haptics";

export default function ContinueWatching({ openPlayer }) {
  const { activeProfile } = useProfile() || {};
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    hapticFeedback.medium();
    
    // Optimistic update
    setHistory(prev => prev.filter(item => item.id !== id));
    
    const { error } = await supabase
      .from('continue_watching')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting from history:", error);
    }
  };

  useEffect(() => {
    async function loadHistory() {
      if (!activeProfile) {
        setHistory([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("continue_watching")
        .select("*")
        .eq("profile_id", activeProfile.id)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    }

    loadHistory();

    // Subscribe to changes
    if (activeProfile) {
      const channel = supabase
        .channel(`continue_watching_${activeProfile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'continue_watching',
            filter: `profile_id=eq.${activeProfile.id}`
          },
          () => {
            loadHistory();
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel) };
    }
  }, [activeProfile]);

  if (loading || history.length === 0) return null;

  return (
    <div style={{ width: '100%', marginBottom: '3rem' }}>
      <h2 style={{ 
        color: '#fff', 
        fontSize: '1.4rem', 
        fontWeight: 600, 
        marginBottom: '1rem',
        paddingLeft: '1.5rem',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
      }}>
        Continue Assistindo como {activeProfile.name}
      </h2>

      <div 
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: '1.2rem',
          overflowX: 'auto',
          padding: '0.5rem 1.5rem 2rem',
          scrollBehavior: 'smooth'
        }}
      >
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => {
              // Reconstruct item to pass to PlayerOverlay
              openPlayer({
                id: item.tmdb_id,
                title: item.title,
                name: item.title,
                media_type: item.media_type,
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                overview: `Resumindo ${item.media_type === 'tv' ? 'Episódio ' + item.progress : 'Filme'}`
              });
            }}
            className="apple-card-hover"
            style={{
              flex: '0 0 var(--card-width-large)',
              width: 'var(--card-width-large)',
              cursor: 'pointer',
              borderRadius: '14px',
              backgroundColor: '#1a1a24',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              overflow: 'hidden'
            }}
          >
            <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative' }}>
               <img 
                 src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')} 
                 alt={item.title}
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
               />
               <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)'
               }}></div>
               
               {/* Delete Button */}
               <button
                 className="delete-history-btn"
                 onClick={(e) => handleDelete(e, item.id)}
                 style={{
                   position: 'absolute',
                   top: '0.5rem',
                   right: '0.5rem',
                   width: '32px',
                   height: '32px',
                   borderRadius: '50%',
                   background: 'rgba(0,0,0,0.6)',
                   border: '1px solid rgba(255,255,255,0.2)',
                   color: '#fff',
                   fontSize: '1.2rem',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   backdropFilter: 'blur(5px)',
                   opacity: 0,
                   transition: 'opacity 0.2s, background 0.2s',
                   zIndex: 10
                 }}
                 onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,59,48,0.8)'}
                 onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                 title="Remover do histórico"
               >
                 ×
               </button>
               
               {/* Progress bar simulation */}
               <div style={{
                 position: 'absolute',
                 bottom: 0, left: 0, right: 0, height: '4px',
                 background: 'rgba(255,255,255,0.2)'
               }}>
                 <div style={{
                   width: item.media_type === 'tv' ? '100%' : '50%', // Fake progress for movies, full for TV since it represents an episode
                   height: '100%',
                   background: '#ff3b30'
                 }}></div>
               </div>
            </div>

            <div style={{ 
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              right: '1rem'
            }}>
              <h4 style={{ 
                margin: 0, 
                fontSize: '1rem', 
                color: '#fff', 
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textShadow: '0 2px 5px rgba(0,0,0,0.8)'
              }}>
                {item.title}
              </h4>
              {item.media_type === 'tv' && (
                 <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>
                   Episódio {item.progress}
                 </p>
              )}
            </div>

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '40px', height: '40px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.2)',
              opacity: 0,
              transition: 'opacity 0.2s'
            }} className="play-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .apple-card-hover:hover .play-icon { opacity: 1 !important; }
        .apple-card-hover:hover .delete-history-btn { opacity: 1 !important; }
      `}} />
    </div>
  );
}
