"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthModal({ isOpen, onClose }) {
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