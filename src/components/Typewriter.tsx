import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface TypewriterProps {
  text: string;
  speed?: number; // ms per character (stagger)
  className?: string;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 0.04, className }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const letters = containerRef.current?.querySelectorAll('.typewriter-letter');
    if (letters) {
      gsap.set(letters, { opacity: 0, y: 10 });
      gsap.to(letters, {
        opacity: 1,
        y: 0,
        stagger: speed,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [text, speed]);

  return (
    <span ref={containerRef} className={className}>
      {text.split('').map((char, i) => (
        <span key={i} className="typewriter-letter inline-block whitespace-pre">{char}</span>
      ))}
    </span>
  );
};

export default Typewriter; 