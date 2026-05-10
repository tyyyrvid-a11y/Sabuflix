"use client";

import { useProfile } from "@/lib/ProfileContext";

export default function AdultCensor({ isAdult, isBackground = false }) {
  const { isCensored } = useProfile();

  if (!isAdult || !isCensored) return null;

  if (isBackground) {
    return (
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backdropFilter: 'blur(50px) saturate(150%)',
        WebkitBackdropFilter: 'blur(50px) saturate(150%)',
        zIndex: 2 // Above the image but below the gradient overlay
      }} />
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backdropFilter: 'blur(30px) saturate(150%)',
      WebkitBackdropFilter: 'blur(30px) saturate(150%)',
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
      pointerEvents: 'none' // allow clicks to pass through
    }}>
      <div style={{
        background: '#ff3b30',
        color: '#fff',
        fontWeight: 'bold',
        padding: '0.4rem 0.8rem',
        borderRadius: '100px',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
      }}>
        <span style={{ fontSize: '1.2rem' }}>🔞</span> 18+
      </div>
    </div>
  );
}
