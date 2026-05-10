"use client";

import { useEffect, useState } from "react";
import { getMovieRating, getTVRating } from "@/lib/tmdb";

export default function RatingBadge({ item }) {
  const [rating, setRating] = useState(null);

  useEffect(() => {
    let active = true;
    
    const fetchRating = async () => {
      if (!item || !item.id) return;
      
      const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
      
      try {
        if (mediaType === 'movie') {
          const data = await getMovieRating(item.id);
          if (data && data.results && active) {
            const brRelease = data.results.find(r => r.iso_3166_1 === 'BR');
            if (brRelease && brRelease.release_dates && brRelease.release_dates.length > 0) {
              const cert = brRelease.release_dates.find(r => r.certification)?.certification;
              if (cert) setRating(cert);
            } else {
               const usRelease = data.results.find(r => r.iso_3166_1 === 'US');
               if (usRelease && usRelease.release_dates) {
                 const cert = usRelease.release_dates.find(r => r.certification)?.certification;
                 if (cert) setRating(cert);
               }
            }
          }
        } else if (mediaType === 'tv') {
          const data = await getTVRating(item.id);
          if (data && data.results && active) {
            const brRating = data.results.find(r => r.iso_3166_1 === 'BR');
            if (brRating && brRating.rating) {
              setRating(brRating.rating);
            } else {
              const usRating = data.results.find(r => r.iso_3166_1 === 'US');
              if (usRating && usRating.rating) {
                setRating(usRating.rating);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch rating:", err);
      }
    };
    
    fetchRating();
    return () => { active = false; };
  }, [item]);

  if (!rating) return null;

  // Format rating for Brazil standards (L, 10, 12, 14, 16, 18)
  let bgColor = 'rgba(255,255,255,0.2)';
  let color = '#fff';
  let displayRating = rating;

  const r = rating.toString().toUpperCase();
  if (r === 'L') {
    bgColor = '#00a000'; // Green
    color = '#fff';
  } else if (r === '10') {
    bgColor = '#00a0e0'; // Blue
    color = '#fff';
  } else if (r === '12') {
    bgColor = '#f0c000'; // Yellow
    color = '#000';
  } else if (r === '14') {
    bgColor = '#f08000'; // Orange
    color = '#fff';
  } else if (r === '16') {
    bgColor = '#f00000'; // Red
    color = '#fff';
  } else if (r === '18') {
    bgColor = '#000000'; // Black
    color = '#fff';
  } else if (r === 'R' || r === 'TV-MA') {
    bgColor = '#000000';
    displayRating = '18';
  } else if (r === 'PG-13' || r === 'TV-14') {
    bgColor = '#f08000';
    displayRating = '14';
  }

  return (
    <div style={{
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      background: bgColor,
      color: color,
      fontWeight: 'bold',
      width: '26px',
      height: '26px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.8rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
      zIndex: 5,
      border: displayRating === '18' ? '1px solid #ff3b30' : 'none',
      fontFamily: 'var(--font-inter)'
    }}>
      {displayRating}
    </div>
  );
}
