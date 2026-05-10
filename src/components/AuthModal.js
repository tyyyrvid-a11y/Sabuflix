"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthModal({ isOpen, onClose, hideClose = false }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Verifique seu email para confirmar o cadastro!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <div 
      onClick={hideClose ? undefined : onClose}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(30, 29, 27, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 100000,
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
          padding: "3rem 2.5rem",
          borderRadius: "24px",
          background: "rgba(44, 42, 40, 0.85)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
        }}
      >
        {!hideClose && (
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
        )}

        <h2 style={{
          color: "#fff",
          fontSize: "2rem",
          fontFamily: "var(--font-title)",
          fontWeight: 400,
          marginBottom: "2rem",
          textAlign: "center",
          letterSpacing: "-0.02em"
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
              marginTop: "0.5rem",
              padding: "1rem",
              borderRadius: "12px",
              border: "none",
              background: "#fff",
              color: "#1e1d1b",
              fontSize: "1rem",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
            }}
            onMouseOver={(e) => {
              if(!loading) {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
              }
            }}
            onMouseOut={(e) => {
              if(!loading) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
              }
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
              cursor: "pointer",
              color: "#fff",
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