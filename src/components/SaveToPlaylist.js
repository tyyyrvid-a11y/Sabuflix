"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export default function SaveToPlaylist({ item }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const checkIfSaved = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: playlists } = await supabase
      .from("playlists")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (playlists && playlists.length > 0) {
      const { data } = await supabase
        .from("playlist_items")
        .select("id")
        .eq("playlist_id", playlists[0].id)
        .eq("tmdb_id", item.id)
        .single();
      setSaved(!!data);
    }
  }, [item.id]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user);
      if (data?.user) checkIfSaved();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user);
      if (session?.user) checkIfSaved();
    });

    return () => subscription.unsubscribe();
  }, [checkIfSaved]);

  const toggleSave = async () => {
    if (!user) {
      alert("Faça login para salvar na sua lista!");
      return;
    }

    setLoading(true);

    const { data: playlists } = await supabase
      .from("playlists")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (!playlists || playlists.length === 0) {
      setLoading(false);
      return;
    }

    const playlistId = playlists[0].id;

    if (saved) {
      await supabase
        .from("playlist_items")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("tmdb_id", item.id);
      setSaved(false);
    } else {
      await supabase
        .from("playlist_items")
        .insert({
          playlist_id: playlistId,
          tmdb_id: item.id,
          media_type: item.media_type || (item.title ? "movie" : "tv"),
          title: item.title || item.name,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average,
          overview: item.overview
        });
      setSaved(true);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className="glass-panel"
      style={{
        padding: "0.6rem 1rem",
        borderRadius: "100px",
        border: saved ? "2px solid #fff" : "2px solid rgba(255,255, 255, 0.3)",
        background: saved ? "#fff" : "rgba(0, 0, 0, 0.3)",
        color: saved ? "#000" : "#fff",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.3s ease",
        fontSize: "0.85rem"
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>
        {saved ? "✓" : "+"}
      </span>
      <span>{saved ? "Na Lista" : "Minha Lista"}</span>
    </button>
  );
}