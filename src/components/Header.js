"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProfileMenu from "./ProfileMenu";
import { hapticFeedback } from "@/lib/haptics";

export default function Header() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user);
    });

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      padding: "1rem var(--spacing-px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: scrolled ? "rgba(10, 10, 12, 0.85)" : "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
      backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
      transition: "background 0.4s ease, backdrop-filter 0.4s ease, border-bottom 0.4s ease",
      pointerEvents: scrolled ? "auto" : "none" // Only let background click through if not scrolled
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        <Link
          href="/"
          onClick={() => hapticFeedback.light()}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.2rem",
            color: "#fff",
            fontSize: "1.4rem",
            fontFamily: "var(--font-title)",
            letterSpacing: "-0.04em",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            transition: "transform 0.2s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ fontWeight: 700 }}>Sabu</span>
          <span style={{ fontWeight: 400, opacity: 0.9 }}>Flix</span>
        </Link>
      </div>

      <nav style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        pointerEvents: 'auto'
      }}>
        <Link
          href="/genres"
          onClick={() => hapticFeedback.light()}
          className="nav-header-desktop"
          style={{
            textDecoration: "none",
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.95rem",
            fontWeight: 500,
            transition: "color 0.3s ease",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)"
          }}
          onMouseOver={(e) => e.target.style.color = '#fff'}
          onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
        >
          Gêneros
        </Link>
        <Link
          href="/playlist"
          onClick={() => hapticFeedback.light()}
          className="nav-header-desktop"
          style={{
            textDecoration: "none",
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.95rem",
            fontWeight: 500,
            transition: "color 0.3s ease",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)"
          }}
          onMouseOver={(e) => e.target.style.color = '#fff'}
          onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
        >
          Minha Lista
        </Link>
        <ProfileMenu user={user} />
      </nav>
    </header>

    {/* Bottom Tab Bar for Mobile/PWA */}
    <nav className="bottom-tab-bar">
      <Link href="/" onClick={() => hapticFeedback.light()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: '#fff', opacity: 0.8 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Início</span>
      </Link>
      
      <Link href="/genres" onClick={() => hapticFeedback.light()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: '#fff', opacity: 0.8 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" x2="12" y1="8" y2="8"/><line x1="3.95" x2="8.54" y1="6.06" y2="14"/><line x1="10.88" x2="15.46" y1="21.94" y2="14"/></svg>
        <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Explorar</span>
      </Link>

      <Link href="/playlist" onClick={() => hapticFeedback.light()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: '#fff', opacity: 0.8 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
        <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Sua Lista</span>
      </Link>
    </nav>
    </>
  );
}