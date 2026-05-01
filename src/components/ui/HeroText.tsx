import { useEffect, useRef } from 'react';

export default function HeroText() {
  const titleRef = useRef<HTMLHeadingElement>(null!);
  const subtitleRef = useRef<HTMLParagraphElement>(null!);

  useEffect(() => {
    // fade out hero text as user scrolls past 10%
    const onScroll = () => {
      const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      const opacity = Math.max(0, 1 - progress / 0.12);
      titleRef.current.style.opacity = String(opacity);
      subtitleRef.current.style.opacity = String(opacity);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <h1
        ref={titleRef}
        style={{
          fontFamily: '"Editorial New", serif',
          fontSize: 'clamp(3rem, 10vw, 9rem)',
          fontWeight: 400,
          color: '#F0EBE1',
          margin: 0,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          transition: 'opacity 0.1s linear',
        }}
      >
        Your Name
      </h1>
      <p
        ref={subtitleRef}
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
          color: '#C8A96E',
          marginTop: '1.5rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          transition: 'opacity 0.1s linear',
        }}
      >
        web designer &amp; developer · disponibile
      </p>
    </div>
  );
}
