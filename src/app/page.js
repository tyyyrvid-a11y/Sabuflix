"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getTrending } from "@/lib/tmdb";
import HeroBackground from "@/components/HeroBackground";
import SmartSearch from "@/components/SmartSearch";
import ForYou from "@/components/ForYou";
import PlayerOverlay from "@/components/PlayerOverlay";
import BiographyModal from "@/components/BiographyModal";
import ContinueWatching from "@/components/ContinueWatching";
import { hapticFeedback } from "@/lib/haptics";
import ClaudeBubbles from "@/components/ClaudeBubbles";

export default function Home() {
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [heroItem, setHeroItem] = useState(null);
  const [playerItem, setPlayerItem] = useState(null);
  const [biographyPerson, setBiographyPerson] = useState(null);
  const debounceRef = useRef(null);

  // Listen for header search selections (dispatched as custom events)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) setPlayerItem(e.detail);
    };
    window.addEventListener("sabuflix:play", handler);
    return () => window.removeEventListener("sabuflix:play", handler);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(val.trim());
    }, 400);
  };

  const clearSearch = () => {
    setInputValue("");
    setQuery("");
    hapticFeedback.light();
  };

  const handleSetBackdrop = useCallback((url) => {
    setHeroItem((prev) => {
      if (prev?.backdrop_path === url) return prev;
      return { ...prev, backdrop_path: url };
    });
  }, []);

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <ClaudeBubbles />
      <HeroBackground
        backdropPath={heroItem?.backdrop_path || heroItem?.poster_path}
        isAdult={heroItem?.adult}
      />

      <div style={{
        position: "relative",
        zIndex: 10,
        padding: "1.5rem var(--spacing-px)",
        paddingTop: "2rem",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "100%",
        boxSizing: "border-box",
      }}>

        {/* Hero info */}
        {!query && heroItem && (
          <div className="animate-fade-in" style={{
            marginTop: "10vh",
            marginBottom: "2rem",
            width: "100%",
            maxWidth: "600px",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            textShadow: "0 2px 20px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.3)",
          }}>
            <h1 style={{
              fontSize: "3.5rem",
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
              fontFamily: "var(--font-title)",
              letterSpacing: "-1px",
            }}>
              {heroItem.title || heroItem.name}
            </h1>

            <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", fontSize: "0.9rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
              <span>{Math.round(heroItem.vote_average * 10)}% Match</span>
              <span>{heroItem.media_type === "tv" ? "Série" : "Filme"}</span>
              {(heroItem.release_date || heroItem.first_air_date) && (
                <span>{(heroItem.release_date || heroItem.first_air_date).substring(0, 4)}</span>
              )}
            </div>

            <p style={{
              fontSize: "1.05rem",
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.9)",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {heroItem.overview || "Descubra os mistérios deste título."}
            </p>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                onClick={() => { hapticFeedback.light(); setPlayerItem(heroItem); }}
                style={{
                  background: "#fff",
                  color: "#1e1d1b",
                  border: "none",
                  padding: "0.8rem 2.5rem",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.5)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"; }}
              >
                ▶ Assistir
              </button>
            </div>
          </div>
        )}

        {/* ── Centered Search Bar ── */}
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: query ? "3rem" : "2.5rem",
          marginBottom: query ? "2.5rem" : "3.5rem",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div
            className="glass-panel animate-fade-in-up"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.75rem 1.25rem 0.75rem 1.75rem",
              borderRadius: "100px",
              width: "min(680px, 92vw)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: query
                ? "0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)"
                : "0 6px 28px rgba(0,0,0,0.35)",
              transition: "box-shadow 0.4s ease, background 0.4s ease",
              animationDelay: "0.1s",
            }}
          >
            <div className="glass-panel-glow" />
            {/* Search icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>

            <input
              id="main-search-input"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Busque filmes, séries, pessoas..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "1.15rem",
                fontFamily: "var(--font-inter)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                width: "100%",
                padding: "0.85rem 0",
                caretColor: "#fff",
              }}
            />

            {/* Clear button */}
            {inputValue && (
              <button
                onClick={clearSearch}
                className="animate-fade-in"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.65)",
                  flexShrink: 0,
                  padding: 0,
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search results */}
        {query && (
          <div className="animate-fade-in" style={{ width: "100%" }}>
            <SmartSearch
              query={query}
              setBackdrop={handleSetBackdrop}
              openPlayer={setPlayerItem}
              openBiography={setBiographyPerson}
            />
          </div>
        )}

        {/* Home content — always visible when not searching */}
        {!query && (
          <>
            <ContinueWatching openPlayer={setPlayerItem} />
            <ForYou
              setHeroItem={setHeroItem}
              openPlayer={setPlayerItem}
            />
          </>
        )}
      </div>

      {playerItem && (
        <PlayerOverlay item={playerItem} onClose={() => setPlayerItem(null)} />
      )}

      {biographyPerson && (
        <BiographyModal person={biographyPerson} onClose={() => setBiographyPerson(null)} openPlayer={setPlayerItem} />
      )}
    </main>
  );
}
