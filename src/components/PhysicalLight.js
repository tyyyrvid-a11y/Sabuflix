"use client";

import { useEffect } from "react";

export default function PhysicalLight() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Find all glass panels
      const panels = document.querySelectorAll('.glass-panel');
      
      panels.forEach((panel) => {
        // Calculate physics: local coordinate relative to the current panel
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Apply physical light location for radial CSS glare/refraction
        panel.style.setProperty('--mouse-x', `${x}px`);
        panel.style.setProperty('--mouse-y', `${y}px`);

        // Calculate 3D tilt (max 5 degrees)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = (y - centerY) / centerY * 5; 
        const tiltY = (x - centerX) / centerX * -5;

        panel.style.setProperty('--tilt-x', `${tiltX}deg`);
        panel.style.setProperty('--tilt-y', `${tiltY}deg`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return null;
}
