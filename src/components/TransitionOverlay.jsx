import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function TransitionOverlay({ isTransitioning, onMidpoint, onComplete }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isTransitioning) {
      // Configuración inicial: totalmente negro y bloqueando clics
      gsap.killTweensOf(overlayRef.current);
      overlayRef.current.style.pointerEvents = 'auto';

      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          // Llamamos al midpoint para cambiar el estado de la sala y resetear la cámara
          if (onMidpoint) onMidpoint();

          // Esperamos un instante en negro para que el cambio de renderizado ocurra limpio
          gsap.delayedCall(0.1, () => {
            gsap.to(overlayRef.current, {
              opacity: 0,
              duration: 0.5,
              ease: 'power2.inOut',
              onComplete: () => {
                overlayRef.current.style.pointerEvents = 'none';
                if (onComplete) onComplete();
              }
            });
          });
        }
      });
    }
  }, [isTransitioning, onMidpoint, onComplete]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000000',
        opacity: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#D4AF37',
        fontFamily: 'serif',
        letterSpacing: '6px',
        fontSize: '12px'
      }}
    >
      <div style={{ transform: 'translateY(-20px)', opacity: 0.8, animation: 'pulse 1.5s infinite alternate' }}>
        ACCEDIENDO A LA SIGUIENTE GALERÍA...
      </div>
      <style>{`
        @keyframes pulse {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
