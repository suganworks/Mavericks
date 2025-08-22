import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/*
 * FuturisticBackground
 * Layered interactive background with:
 *  - Parallax starfield
 *  - Animated gradient pulses
 *  - Mouse reactive spotlight
 *  - Subtle scanlines
 */
export default function FuturisticBackground({ intensity = 0.25 }) {
  const spotlightRef = useRef(null);

  useEffect(() => {
    function handlePointer(e) {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty('--spot-x', `${x}%`);
        spotlightRef.current.style.setProperty('--spot-y', `${y}%`);
      }
    }
    window.addEventListener('pointermove', handlePointer);
    return () => window.removeEventListener('pointermove', handlePointer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Gradient mesh / pulses */}
      <div className="absolute inset-0 opacity-60 mix-blend-screen">
        <div className="absolute -top-1/2 -left-1/4 w-[120vw] h-[120vh] bg-[radial-gradient(circle_at_30%_30%,rgba(120,0,255,0.35),transparent_60%)] animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[120vw] h-[120vh] bg-[radial-gradient(circle_at_70%_70%,rgba(0,180,255,0.30),transparent_65%)] animate-[pulse_9s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] bg-[conic-gradient(from_0deg,rgba(255,255,255,0.05),transparent_40%,rgba(255,255,255,0.05))] blur-3xl opacity-40" />
      </div>

      {/* Spotlight (mouse reactive) */}
      <div ref={spotlightRef} className="absolute inset-0 bg-[radial-gradient(circle_at_var(--spot-x,50%)_var(--spot-y,50%),rgba(255,255,255,0.18),rgba(0,0,0,0)_55%)] transition-[background] duration-150" />

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.12)_0px,rgba(255,255,255,0.12)_1px,transparent_1px,transparent_3px)]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:140px_140px]" />

      {/* Floating particles (framer-motion) */}
      <div className="absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => {
          const delay = (i % 6) * 1.5;
          const size = Math.random() * 4 + 2;
          return (
            <motion.span
              key={i}
              className="absolute rounded-full bg-cyan-300/60 shadow-[0_0_6px_2px_rgba(0,255,255,0.35)]"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: size,
                height: size
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 0], y: [-10, 10, -10] }}
              transition={{ duration: 12 + Math.random() * 6, repeat: Infinity, delay }}
            />
          );
        })}
      </div>
    </div>
  );
}
