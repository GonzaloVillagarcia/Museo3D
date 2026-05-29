import React, { useState } from 'react';
import * as THREE from 'three';

export default function Waypoint({ position, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Anillo Interior */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.24, 32]} />
        <meshBasicMaterial
          color={isActive ? "#D4AF37" : (hovered ? "#ffffff" : "#c8a853")}
          transparent={true}
          opacity={isActive ? 0.95 : (hovered ? 0.8 : 0.35)}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Anillo Exterior */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.35, 32]} />
        <meshBasicMaterial
          color={isActive ? "#D4AF37" : (hovered ? "#ffffff" : "#c8a853")}
          transparent={true}
          opacity={isActive ? 0.6 : (hovered ? 0.45 : 0.15)}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Círculo Invisible para Mayor Área de Click */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0, 0.6, 8]} />
      </mesh>
    </group>
  );
}
