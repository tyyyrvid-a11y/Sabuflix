"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchMulti, getImageUrl } from "@/lib/tmdb";
import { hapticFeedback } from "@/lib/haptics";

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function HeaderSearch() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debouncedQuery = useDebounce(query, 380);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    searchMulti(debouncedQuery).then((data) => {
      if (!active) return;
      const valid = (data?.results || [])
        .filter((r) => r.poster_path || r.profile_path)
        .slice(0, 7);
      setResults(valid);
      setLoading(false);
    });

    return () => { active = false; };
  }, [debouncedQuery]);

  // Expand and focus input
  const handleOpen = () => {
    hapticFeedback.light();
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Collapse and reset
  const handleClose = useCallback(() => {
    setExpanded(false);
    setQuery("");
    setResults([]);
    setFocused(false);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleClose();
      }
    };
    if (expanded) {
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler);
    }
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [expanded, handleClose]);

  // Keyboard: Escape to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClose]);

  const handleSelect = (item) => {
    hapticFeedback.light();
    // Dispatch a custom event so any page can listen and open the player
    window.dispatchEvent(new CustomEvent("sabuflix:play", { detail: item }));
    handleClose();
  };

  const showDropdown = expanded && focused && (loading || results.length > 0 || (query.trim().length > 1 && !loading));

  return (
    <div ref={containerRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {/* Collapsed: Icon only */}
      {!expanded && (
        <button
          id="header-search-btn"
          onClick={handleOpen}
          aria-label="Abrir pesquisa"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0.4rem",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.75)",
            transition: "color 0.2s ease, transform 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      )}

      {/* Expanded: Search bar */}
      {expanded && (
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "100px",
            padding: "0.35rem 0.75rem 0.35rem 1rem",
            width: "clamp(220px, 30vw, 380px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Search icon inside bar */}
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>

          <input
            ref={inputRef}
            id="header-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Filmes, séries, pessoas..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "0.9rem",
              fontFamily: "var(--font-inter)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              width: "100%",
              caretColor: "#fff",
            }}
          />

          {/* Loading spinner */}
          {loading && (
            <div style={{
              width: "16px",
              height: "16px",
              border: "2px solid rgba(255,255,255,0.15)",
              borderTopColor: "rgba(255,255,255,0.7)",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              flexShrink: 0,
            }} />
          )}

          {/* Clear button */}
          {query && !loading && (
            <button
              onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                flexShrink: 0,
                padding: 0,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Close/collapse button */}
          <button
            onClick={handleClose}
            aria-label="Fechar pesquisa"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              padding: "0 0.1rem",
              flexShrink: 0,
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.9)"}
            onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Dropdown results */}
      {showDropdown && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "clamp(280px, 35vw, 440px)",
            background: "rgba(18, 17, 15, 0.95)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* Empty state */}
          {!loading && results.length === 0 && query.trim().length > 1 && (
            <div style={{
              padding: "2rem",
              textAlign: "center",
              color: "rgba(255,255,255,0.35)",
              fontSize: "0.9rem",
              fontFamily: "var(--font-inter)",
            }}>
              Nenhum resultado para "<strong style={{ color: "rgba(255,255,255,0.6)" }}>{query}</strong>"
            </div>
          )}

          {/* Results list */}
          {results.map((item, idx) => {
            const img = getImageUrl(item.poster_path || item.profile_path, "w92");
            const title = item.title || item.name;
            const year = (item.release_date || item.first_air_date || "").substring(0, 4);
            const typeLabel = item.media_type === "movie" ? "Filme" : item.media_type === "tv" ? "Série" : "Pessoa";
            const rating = item.vote_average ? `${Math.round(item.vote_average * 10)}%` : null;

            return (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => handleSelect(item)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  padding: "0.7rem 1rem",
                  borderBottom: idx < results.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  transition: "background 0.15s ease",
                  textAlign: "left",
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                {/* Poster thumbnail */}
                <div style={{
                  width: "40px",
                  height: "60px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.05)",
                }}>
                  {img && (
                    <img
                      src={img}
                      alt={title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: "#fff",
                    fontFamily: "var(--font-inter)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: "0.2rem",
                  }}>
                    {title}
                  </div>
                  <div style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}>
                    <span style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.35)",
                      background: "rgba(255,255,255,0.07)",
                      padding: "0.1rem 0.45rem",
                      borderRadius: "100px",
                      fontWeight: 500,
                    }}>
                      {typeLabel}
                    </span>
                    {year && (
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
                        {year}
                      </span>
                    )}
                    {rating && (
                      <span style={{ fontSize: "0.72rem", color: "rgba(217,119,87,0.9)", fontWeight: 600 }}>
                        {rating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Spinner keyframes injected inline */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
