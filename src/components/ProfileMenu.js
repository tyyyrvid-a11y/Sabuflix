"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import { useProfile } from "@/lib/ProfileContext";
import { hapticFeedback } from "@/lib/haptics";

export default function ProfileMenu() {
  const { user, activeProfile, profiles, changeProfile, addProfile, loading, isCensored, toggleCensor } = useProfile();
  const [showProfiles, setShowProfiles] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const isMandatory = user && !activeProfile && !loading;
  const displayModal = showProfiles || isMandatory;

  const avatars = [
    { id: "default", emoji: "👤", color: "rgba(44, 42, 40, 0.8)", name: "Padrão" },
    { id: "red", emoji: "🔥", color: "#5c3a35", name: "Fogo" },
    { id: "blue", emoji: "💙", color: "#354a5c", name: "Oceano" },
    { id: "green", emoji: "💚", color: "#3a523d", name: "Natureza" },
    { id: "purple", emoji: "💜", color: "#48355c", name: "Magia" },
    { id: "orange", emoji: "🧡", color: "#61402e", name: "Pôr do Sol" },
  ];

  const handleCreateProfile = async () => {
    const name = prompt("Qual o nome do novo perfil?");
    if (!name) return;
    
    // Select a random avatar color (excluding default)
    const randomAvatar = avatars[Math.floor(Math.random() * (avatars.length - 1)) + 1];
    await addProfile(name, randomAvatar.id);
  };

  const handleSelectProfile = (profileId) => {
    hapticFeedback.success();
    changeProfile(profileId);
    setShowProfiles(false);
  };

  if (loading) {
    return <div className="glass-panel" style={{ padding: "0.5rem 1rem", borderRadius: "100px", border: "none" }}>...</div>;
  }

  if (!user) {
    return (
      <AuthModal isOpen={true} onClose={() => {}} hideClose={true} />
    );
  }

  const currentAvatar = avatars.find(a => a.id === activeProfile?.avatar) || avatars[0];

  return (
    <>
      <div style={{ position: "relative" }}>
        {/* Trigger Button in Header */}
        <button
          onClick={() => {
            hapticFeedback.light();
            setShowProfiles(true);
          }}
          className="glass-panel"
          style={{
            padding: "0.5rem 1.2rem",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: currentAvatar.color,
            color: "#fff",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)";
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>{currentAvatar.emoji}</span>
          <span>{activeProfile?.name || user.email?.split("@")[0]}</span>
        </button>

        {/* Full Screen Apple TV Modal */}
        {displayModal && (
          <div
            className="animate-fade-in"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 99999, // Ensure it's above everything
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(30, 29, 27, 0.95)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
            }}
          >
            {/* Close button */}
            {!isMandatory && (
              <button
                onClick={() => {
                  hapticFeedback.light();
                  setShowProfiles(false);
                }}
                style={{
                  position: "absolute",
                  top: "2.5rem",
                  right: "3rem",
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#fff",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  fontSize: "1.8rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                ×
              </button>
            )}

            <h1 style={{
              fontSize: "3.5rem",
              fontWeight: 600,
              marginBottom: "4rem",
              color: "#fff",
              textShadow: "0 4px 20px rgba(0,0,0,0.6)",
              letterSpacing: "-0.03em"
            }}>
              Quem está assistindo?
            </h1>

            <div style={{ 
              display: "flex", 
              gap: "2.5rem", 
              alignItems: "flex-start", 
              flexWrap: "wrap", 
              justifyContent: "center", 
              maxWidth: "1200px",
              padding: "0 2rem"
            }}>
              {profiles.map((p) => {
                const isSelected = activeProfile?.id === p.id;
                const pAvatar = avatars.find(a => a.id === p.avatar) || avatars[0];
                return (
                  <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                    <button
                      onClick={() => handleSelectProfile(p.id)}
                      className="apple-card-hover"
                      style={{
                        width: "160px",
                        height: "160px",
                        borderRadius: "50%",
                        background: pAvatar.color,
                        border: isSelected ? "2px solid #fff" : "1px solid rgba(255,255,255,0.1)",
                        fontSize: "4.5rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isSelected ? "0 0 0 4px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.4)",
                        transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        outline: "none"
                      }}
                    >
                      {pAvatar.emoji}
                    </button>
                    <span style={{
                      fontSize: "1.3rem",
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "#fff" : "rgba(255,255,255,0.7)",
                      transition: "color 0.3s",
                      textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                    }}>
                      {p.name}
                    </span>
                  </div>
                );
              })}

              {/* Add Profile Button */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                <button
                  className="apple-card-hover"
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    border: "5px solid transparent",
                    fontSize: "4.5rem",
                    color: "rgba(255,255,255,0.8)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    outline: "none"
                  }}
                  onClick={() => {
                    hapticFeedback.medium();
                    handleCreateProfile();
                  }}
                >
                  +
                </button>
                <span style={{
                  fontSize: "1.3rem",
                  color: "rgba(255,255,255,0.7)",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                }}>
                  Adicionar
                </span>
              </div>
            </div>

            {/* Bottom Actions - Hidden during mandatory selection to force focus on picking a profile */}
            {!isMandatory && (
              <div style={{
                marginTop: "6rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2rem"
              }}>
              {/* Settings / Toggles */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500 }}>Filtro +18:</span>
                <button
                  onClick={() => {
                    hapticFeedback.light();
                    toggleCensor();
                  }}
                  className="glass-panel"
                  style={{
                    padding: "0.6rem 1.5rem",
                    borderRadius: "12px",
                    border: isCensored ? "1px solid rgba(217, 119, 87, 0.4)" : "1px solid rgba(255,255,255,0.1)",
                    background: isCensored ? "rgba(217, 119, 87, 0.15)" : "rgba(255,255,255,0.05)",
                    color: isCensored ? "var(--color-accent)" : "rgba(255,255,255,0.6)",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  {isCensored ? "Ligado" : "Desligado"}
                </button>
              </div>

              {/* Links and Actions */}
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <a
                href="/playlist"
                onClick={() => setShowProfiles(false)}
                className="glass-panel"
                style={{
                  padding: "0.8rem 2.5rem",
                  borderRadius: "12px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  transition: "background 0.2s, transform 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "var(--color-glass-bg)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Minha Lista
              </a>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setShowProfiles(false);
                }}
                className="glass-panel"
                style={{
                  padding: "0.8rem 2.5rem",
                  borderRadius: "12px",
                  background: "transparent",
                  color: "#ff6b6b",
                  border: "1px solid rgba(255, 107, 107, 0.3)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background 0.2s, transform 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255,0,0,0.15)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "var(--color-glass-bg)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Sair da Conta
                </button>
              </div>
            </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}