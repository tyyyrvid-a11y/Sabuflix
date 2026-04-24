"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";

export default function ProfileMenu({ user }) {
  const [showProfiles, setShowProfiles] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [profile, setProfile] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, [loadProfile]);

  const avatars = [
    { id: "default", emoji: "👤", color: "rgba(255,255,255,0.2)" },
    { id: "red", emoji: "🔥", color: "#ff4444" },
    { id: "blue", emoji: "💙", color: "#4488ff" },
    { id: "green", emoji: "💚", color: "#44ff44" },
    { id: "purple", emoji: "💜", color: "#9944ff" },
    { id: "orange", emoji: "🧡", color: "#ff9944" },
  ];

  const selectAvatar = async (avatarId) => {
    const avatar = avatars.find(a => a.id === avatarId);
    await supabase
      .from("profiles")
      .update({ avatar: avatarId })
      .eq("id", user.id);
    setProfile({ ...profile, avatar: avatarId });
    setShowProfiles(false);
  };

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          className="glass-panel"
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "100px",
            border: "none",
            background: "#fff",
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <span>Entrar</span>
        </button>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  const currentAvatar = avatars.find(a => a.id === profile?.avatar) || avatars[0];

  return (
    <>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowProfiles(!showProfiles)}
          className="glass-panel"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "100px",
            border: "none",
            background: currentAvatar.color,
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.2rem"
          }}
        >
          {currentAvatar.emoji}
          <span style={{ fontSize: "0.85rem" }}>{profile?.name || user.email?.split("@")[0]}</span>
        </button>

        {showProfiles && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "0.5rem",
              padding: "1rem",
              borderRadius: "15px",
              minWidth: "200px",
              zIndex: 100
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button
                onClick={() => setShowProfiles(false)}
                style={{
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                Perfil: {profile?.name || user.email?.split("@")[0]}
              </button>

              <a
                href="/playlist"
                onClick={() => setShowProfiles(false)}
                style={{
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "block"
                }}
              >
                Minha Lista
              </a>

              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                marginTop: "0.5rem",
                paddingTop: "0.5rem"
              }}>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "0.5rem"
                }}>
                  Escolher avatar:
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => selectAvatar(avatar.id)}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        border: profile?.avatar === avatar.id ? "2px solid #fff" : "none",
                        background: avatar.color,
                        fontSize: "1.2rem",
                        cursor: "pointer"
                      }}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setShowProfiles(false);
                }}
                style={{
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(255,0,0,0.3)",
                  color: "#ff6b6b",
                  cursor: "pointer",
                  marginTop: "0.5rem"
                }}
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}