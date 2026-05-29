import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// --- CÁMARAS GENERALES POR SALA ---
const GENERAL_CAMERAS = {
  naciones: { pos: [0, 2.5, 3.5], lookAt: [0, 1.8, -7.5] },
  leyendas: { pos: [0, 2.5, -9.5], lookAt: [0, 1.8, -19.0] },
  dioses: { pos: [0, 2.5, -19.5], lookAt: [0, 1.8, -29.0] },
};

export function CameraRig({ activeIndex, activeRoom, currentExhibits }) {
  const { camera } = useThree();
  const controls = useRef();

  useEffect(() => {
    let targetPos, targetLook;

    if (activeIndex !== null && currentExhibits && currentExhibits[activeIndex]) {
      const exhibit = currentExhibits[activeIndex];
      targetPos = exhibit.camPos;
      // Apunta un poco más arriba de la base del pedestal
      targetLook = [exhibit.pos[0], exhibit.pos[1] + 1.2, exhibit.pos[2]];
    } else {
      const general = GENERAL_CAMERAS[activeRoom];
      if (general) {
        targetPos = general.pos;
        targetLook = general.lookAt;
      }
    }

    if (targetPos && targetLook) {
      gsap.killTweensOf(camera.position);
      if (controls.current) gsap.killTweensOf(controls.current.target);

      const duration = activeIndex !== null ? 2.5 : 3.0;

      gsap.to(camera.position, {
        x: targetPos[0],
        y: targetPos[1],
        z: targetPos[2],
        duration: duration,
        ease: 'power3.inOut',
        onUpdate: () => {
          if (controls.current) controls.current.update();
        }
      });

      if (controls.current) {
        gsap.to(controls.current.target, {
          x: targetLook[0],
          y: targetLook[1],
          z: targetLook[2],
          duration: duration,
          ease: 'power3.inOut'
        });
      }
    }
  }, [activeIndex, activeRoom, currentExhibits, camera]);

  useFrame(() => {
    if (controls.current) {
      controls.current.update();
    }
  });

  const isFocused = activeIndex !== null;

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={isFocused ? Math.PI / 2.05 : Math.PI / 1.35}
      minDistance={isFocused ? 1.5 : 0.5}
      maxDistance={isFocused ? 25 : 30}
      makeDefault
    />
  );
}
