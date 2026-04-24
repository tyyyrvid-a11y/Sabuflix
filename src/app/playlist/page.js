"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PlayerOverlay from "@/components/PlayerOverlay";

export default function PlaylistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [playerItem, setPlayerItem] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: playlists } = await supabase
      .from("playlists")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (playlists && playlists.length > 0) {
      const { data: playlistItems } = await supabase
        .from("playlist_items")
        .select("*")
        .eq("playlist_id", playlists[0].id)
        .order("added_at", { ascending: false });

      setItems(playlistItems || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const removeItem = async (tmdbId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: playlists } = await supabase
      .from("playlists")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (playlists && playlists.length > 0) {
      await supabase
        .from("playlist_items")
        .delete()
        .eq("playlist_id", playlists[0].id)
        .eq("tmdb_id", tmdbId);

      setItems(items.filter(i => i.tmdb_id !== tmdbId));
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff"
      }}>
        <div style={{ fontSize: "1.5rem" }}>Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        color: "#fff"
      }}>
        <div style={{
          fontSize: "4rem",
          marginBottom: "1rem"
        }}>
          📺
        </div>
        <h1 style={{
          fontSize: "2rem",
          marginBottom: "1rem"
        }}>
          Entre para ver sua lista
        </h1>
        <button
          onClick={() => setShowLogin(true)}
          className="glass-panel"
          style={{
            padding: "1rem 2rem",
            borderRadius: "100px",
            border: "none",
            background: "#fff",
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          Entrar
        </button>

        {showLogin && (
          <AuthModalWrapper onClose={() => setShowLogin(false)} />
        )}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "2rem",
      color: "#fff"
    }}>
      <h1 style={{
        fontSize: "2rem",
        marginBottom: "2rem",
        fontWeight: 600
      }}>
        Minha Lista
      </h1>

      {items.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem",
          color: "rgba(255,255,255,0.5)"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p>Sua lista está vazia</p>
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Adicione filmes e séries para assisti-los depois
          </p>
          <Link
            href="/"
            className="glass-panel"
            style={{
              display: "inline-block",
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "100px",
              color: "#000",
              textDecoration: "none",
              background: "#fff"
            }}
          >
            Explorar
          </Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem"
        }}>
          {items.map((item) => (
            <div
              key={`${item.tmdb_id}-${item.media_type}`}
              style={{
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.05)",
                cursor: "pointer",
                transition: "transform 0.3s ease"
              }}
            >
              <img
                src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "/placeholder.png"}
                alt={item.title}
                style={{
                  width: "100%",
                  aspectRatio: "2/3",
                  objectFit: "cover"
                }}
                onClick={() => setPlayerItem({
                  id: item.tmdb_id,
                  title: item.title,
                  media_type: item.media_type,
                  poster_path: item.poster_path,
                  backdrop_path: item.backdrop_path,
                  vote_average: item.vote_average,
                  overview: item.overview
                })}
              />
              <button
                onClick={() => removeItem(item.tmdb_id)}
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.5rem",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem"
                }}
              >
                ×
              </button>
              <div style={{
                padding: "0.75rem",
                fontSize: "0.85rem"
              }}>
                <p style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {playerItem && (
        <PlayerOverlay item={playerItem} onClose={() => setPlayerItem(null)} />
      )}
    </div>
  );
}

function AuthModalWrapper({ onClose }) {
  const [isOpen, setIsOpen] = useState(true);
  return <AuthModalInner isOpen={isOpen} onClose={onClose} />;
}

function AuthModalInner({ isOpen, onClose }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Verifique seu email para confirmar o cadastro!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.9)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-fade-in"
        style={{
          width: "90%",
          maxWidth: "400px",
          padding: "2rem",
          borderRadius: "20px"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "1.5rem"
          }}
        >
          ×
        </button>

        <h2 style={{
          color: "#fff",
          fontSize: "1.8rem",
          fontWeight: 600,
          marginBottom: "1.5rem",
          textAlign: "center"
        }}>
          {mode === "login" ? "Entrar" : "Criar Conta"}
        </h2>

        {error && (
          <div style={{
            background: "rgba(255,0,0,0.2)",
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            color: "#ff6b6b",
            textAlign: "center",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: "rgba(0,255,0,0.2)",
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            color: "#6bff6b",
            textAlign: "center",
            fontSize: "0.9rem"
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "0.9rem 1rem",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontSize: "1rem",
              outline: "none"
            }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              padding: "0.9rem 1rem",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontSize: "1rem",
              outline: "none"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="glass-panel"
            style={{
              padding: "1rem",
              borderRadius: "10px",
              border: "none",
              background: "#fff",
              color: "#000",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Carregando..." : (mode === "login" ? "Entrar" : "Criar Conta")}
          </button>
        </form>

        <p style={{
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
          marginTop: "1rem",
          fontSize: "0.9rem"
        }}>
          {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setMessage(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              textDecoration: "underline"
            }}
          >
            {mode === "login" ? "Cadastre-se" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}