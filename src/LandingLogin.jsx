import React, { useState, useEffect, useRef } from 'react';

export default function LandingLogin({ started, isSceneReady, onLogin, onReadyForCinematic }) {
  const [fakeProgress, setFakeProgress] = useState(0);
  const [visible, setVisible] = useState(true); // Controls actual DOM presence
  const exitTimer = useRef(null);

  // Fake smooth progress to mask heavy Three.js texture decoding
  useEffect(() => {
    let interval;
    if (!isSceneReady) {
      interval = setInterval(() => {
        setFakeProgress(prev => {
          const increment = (95 - prev) * 0.05;
          return prev >= 95 ? 95 : prev + Math.max(increment, 0.1);
        });
      }, 50);
    } else {
      setFakeProgress(100);
    }
    return () => clearInterval(interval);
  }, [isSceneReady]);

  // When login is triggered: fast 400ms CSS fade, then REMOVE from DOM, THEN signal camera to start.
  // This guarantees ZERO concurrent HTML/WebGL rendering during the cinematic pan.
  useEffect(() => {
    if (started) {
      exitTimer.current = setTimeout(() => {
        setVisible(false);
        if (onReadyForCinematic) onReadyForCinematic();
      }, 450);
    }
    return () => clearTimeout(exitTimer.current);
  }, [started, onReadyForCinematic]);

  // Once DOM is removed, render nothing at all = no GPU layer overhead
  if (!visible) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!isSceneReady) return;
    onLogin();
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: started ? 0 : 1,
      pointerEvents: 'none',
      backgroundColor: fakeProgress < 100 ? '#0a0a0a' : 'rgba(0,0,0,0)',
      // Fast 0.4s fade when exiting - must clear GPU BEFORE camera starts moving
      transition: started
        ? 'opacity 0.4s ease-out, background-color 0.4s ease-out'
        : 'background-color 1.5s ease-in-out, opacity 1.5s ease-in-out',
      willChange: 'opacity'
    }}>

      {/* LUXURY LOGIN BOX */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '50px 60px',
        background: 'rgba(15, 15, 15, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '2px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '420px',
        boxSizing: 'border-box',
        opacity: fakeProgress === 100 ? 1 : 0,
        transform: fakeProgress === 100 ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 1.5s ease, transform 1.5s ease',
        pointerEvents: started ? 'none' : (fakeProgress === 100 ? 'auto' : 'none')
      }}>
        
        <h1 style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '36px',
          color: '#ffffff',
          letterSpacing: '8px',
          margin: '0 0 10px 0',
          fontWeight: 400
        }}>THE VAULT</h1>
        
        <p style={{
          fontFamily: '"Syne", sans-serif',
          fontSize: '9px',
          color: '#c8a853',
          letterSpacing: '4px',
          margin: '0 0 40px 0',
          textTransform: 'uppercase',
          opacity: 0.8
        }}>ACCESO RESTRINGIDO</p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          
          <label style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: '10px',
            color: '#888',
            letterSpacing: '2px',
            marginBottom: '10px',
            textTransform: 'uppercase'
          }}>USUARIO</label>
          
          <input 
            type="text" 
            placeholder="admin"
            style={{
              width: '100%',
              padding: '12px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '14px',
              fontFamily: '"Syne", sans-serif',
              letterSpacing: '2px',
              marginBottom: '30px',
              outline: 'none',
              textAlign: 'center'
            }}
          />

          <label style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: '10px',
            color: '#888',
            letterSpacing: '2px',
            marginBottom: '10px',
            textTransform: 'uppercase'
          }}>CONTRASEÑA</label>
          
          <input 
            type="password" 
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '12px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: '#c8a853',
              fontSize: '14px',
              letterSpacing: '8px',
              marginBottom: '20px',
              outline: 'none',
              textAlign: 'center'
            }}
          />

          <div style={{ textAlign: 'right', marginBottom: '40px' }}>
            <a href="#" style={{
              fontFamily: '"Syne", sans-serif',
              fontSize: '10px',
              color: '#888',
              textDecoration: 'none',
              letterSpacing: '1px',
              transition: 'color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#c8a853'}
            onMouseOut={(e) => e.target.style.color = '#888'}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button 
            type="button"
            onClick={() => alert("El login aún no está configurado. Por favor, usa el Acceso Temporal.")}
            style={{
              width: '100%',
              padding: '18px 20px',
              background: '#c8a853',
              border: 'none',
              color: '#000',
              fontSize: '11px',
              fontFamily: '"Syne", sans-serif',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginBottom: '15px',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#e6c875';
              e.target.style.boxShadow = '0 0 20px rgba(200, 168, 83, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#c8a853';
              e.target.style.boxShadow = 'none';
            }}
          >
            INGRESAR
          </button>

          <button 
            type="button"
            onPointerDown={handleLogin}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: '9px',
              fontFamily: '"Syne", sans-serif',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#fff';
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
              e.target.style.background = 'transparent';
            }}
          >
            Acceso Temporal
          </button>
        </div>
      </div>

      {fakeProgress < 100 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '30px',
          zIndex: 5
        }}>
          <div style={{ position: 'relative', width: '60px', height: '60px' }}>
            <div className="loader-ring" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(200, 168, 83, 0.2)',
              borderTopColor: '#c8a853',
              boxSizing: 'border-box'
            }}></div>
          </div>
          <h2 style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: '11px',
            color: '#c8a853',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            margin: 0,
            opacity: 0.8
          }}>
            SINCRONIZANDO
          </h2>
          <span style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: '10px',
            color: '#c8a853',
            letterSpacing: '4px',
          }}>{fakeProgress.toFixed(0)}%</span>
        </div>
      )}
      <style>
        {`
          @keyframes spin-ring {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .loader-ring {
            animation: spin-ring 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
          }
        `}
      </style>
    </div>
  );
}
