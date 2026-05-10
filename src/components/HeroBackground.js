"use client";

import { useEffect, useState } from "react";
import { getImageUrl } from "@/lib/tmdb";
import AdultCensor from "./AdultCensor";

export default function HeroBackground({ backdropPath, isAdult }) {
  const [currentBg, setCurrentBg] = useState(null);
  const [previousBg, setPreviousBg] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (backdropPath !== currentBg) {
      if (currentBg) {
        setPreviousBg(currentBg);
        setIsTransitioning(true);
      }
      setCurrentBg(backdropPath);
      
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPreviousBg(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [backdropPath, currentBg]);

  const renderBg = (path, isPrev) => {
    if (!path) return null;
    return (
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${getImageUrl(path, 'original')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          opacity: isPrev ? (isTransitioning ? 0 : 0.6) : (isTransitioning ? 0.6 : 0.6),
          animation: !isPrev && isTransitioning ? 'fadeIn 1s ease-in-out' : 'none',
          transition: 'opacity 1s ease-in-out',
          zIndex: isPrev ? 1 : 2
        }}
      />
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1,
      backgroundColor: '#1e1d1b'
    }}>
      {renderBg(previousBg, true)}
      {renderBg(currentBg, false)}
      
      <AdultCensor isAdult={isAdult} isBackground={true} />
      
      {/* Dark overlay for readability mimicking tvOS */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to bottom, rgba(30,29,27,0) 0%, rgba(30,29,27,0.5) 40%, rgba(30,29,27,0.95) 80%, #1e1d1b 100%)',
        zIndex: 3
      }} />
    </div>
  );
}
