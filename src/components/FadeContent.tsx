/**
 * FadeContent — lightweight opacity-only IntersectionObserver reveal.
 *
 * Used when a directional translateY would feel excessive (e.g. the hero
 * mobile car image, minor supplementary copy). No GSAP dependency —
 * just CSS opacity + a class toggle. Respects prefers-reduced-motion.
 */
"use client";

import React, { useEffect, useRef, useState } from "react";

interface FadeContentProps {
  children: React.ReactNode;
  /** Delay before the fade begins after element enters viewport (ms) */
  delay?: number;
  /** Duration of the opacity transition (ms) */
  duration?: number;
  /** IntersectionObserver threshold */
  threshold?: number;
  className?: string;
}

export default function FadeContent({
  children,
  delay = 0,
  duration = 600,
  threshold = 0.1,
  className = "",
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Lazy initial state — if reduced motion is set, start visible immediately.
  // This avoids calling setState synchronously inside an effect.
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (visible) return; // already shown (reduced motion)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, visible]);


  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ease`,
        transitionDelay: visible ? `${delay}ms` : "0ms",
        willChange: "opacity",
      }}
    >
      {children}
    </div>
  );
}
