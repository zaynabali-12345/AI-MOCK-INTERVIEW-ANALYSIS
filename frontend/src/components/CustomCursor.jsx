import React, { useState, useEffect } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target;
      setIsPointer(
        window.getComputedStyle(target).getPropertyValue('cursor') === 'pointer'
      );
    };

    const animateTrail = () => {
        setTrailPosition(prevTrailPos => {
            const dx = position.x - prevTrailPos.x;
            const dy = position.y - prevTrailPos.y;
            return {
                x: prevTrailPos.x + dx * 0.2,
                y: prevTrailPos.y + dy * 0.2,
            };
        });
        requestAnimationFrame(animateTrail);
    };

    document.addEventListener('mousemove', onMouseMove);
    const animationFrameId = requestAnimationFrame(animateTrail);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [position]);

  return (
    <>
      <div className={`cursor-trail ${isPointer ? 'pointer' : ''}`} style={{ transform: `translate(${trailPosition.x}px, ${trailPosition.y}px)` }} />
      <div className={`cursor-dot ${isPointer ? 'pointer' : ''}`} style={{ transform: `translate(${position.x}px, ${position.y}px)` }} />
    </>
  );
};

export default CustomCursor;
