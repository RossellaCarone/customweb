import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null!);
  const dotRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      cursorRef.current.style.transform = `translate(${x - 16}px, ${y - 16}px)`;
      dotRef.current.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
    };

    const onEnterLink = () => cursorRef.current.classList.add('filled');
    const onLeaveLink = () => cursorRef.current.classList.remove('filled');

    window.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button, [data-hover]').forEach((el) => {
      el.addEventListener('mouseenter', onEnterLink);
      el.addEventListener('mouseleave', onLeaveLink);
    });

    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1.5px solid #C8A96E',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'background 0.15s ease, transform 0.08s ease',
          mixBlendMode: 'difference',
        }}
        className="cursor-ring"
      />
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#C8A96E',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    </>
  );
}
