import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ROOM_HEIGHT = 6.2;

// --- CANDADO HOLOGRÁFICO FLOTANTE PARA EL PORTAL ---
const FloatingHoloLock = ({ z }) => {
  const group = useRef();

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 1.2;
      group.current.position.y = 2.3 + Math.sin(state.clock.getElapsedTime() * 2.5) * 0.06;
    }
  });

  return (
    <group ref={group} position={[0, 2.3, z]}>
      {/* Cuerpo del candado */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.24, 0.1]} />
        <meshStandardMaterial
          color="#c8a853"
          emissive="#ffa800"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>

      {/* Arco del candado */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <torusGeometry args={[0.09, 0.02, 8, 24, Math.PI]} />
        <meshStandardMaterial
          color="#c8a853"
          emissive="#ffa800"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>

      {/* Cerradura */}
      <mesh position={[0, -0.02, 0.051]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.002, 16]} />
        <meshBasicMaterial color="#1a0b00" />
      </mesh>
      <mesh position={[0, -0.05, 0.051]}>
        <boxGeometry args={[0.015, 0.04, 0.002]} />
        <meshBasicMaterial color="#1a0b00" />
      </mesh>

      <pointLight color="#ffa800" intensity={3.5} distance={3.0} decay={2.0} />
    </group>
  );
};

export default function Portal({ z, isPremiumEnabled }) {
  // Materiales de concreto para el arco
  const archMaterial = new THREE.MeshStandardMaterial({
    color: "#1c1c1c",
    roughness: 0.85,
    metalness: 0.15
  });

  // Material de tiras LED doradas (Emissive)
  const ledMaterial = new THREE.MeshStandardMaterial({
    color: "#D4AF37",
    emissive: "#ffa500",
    emissiveIntensity: 3.5,
    roughness: 0.1,
    metalness: 0.9
  });

  // Altura libre del pasillo en el centro
  const openHeight = ROOM_HEIGHT - 0.4;

  return (
    <group>
      {/* 1. ARQUITECTURA DEL PORTAL (MARCO PRINCIPAL BRUTALISTA) */}
      {/* Pilar Izquierdo */}
      <mesh position={[-3.4, ROOM_HEIGHT / 2, z]} castShadow receiveShadow>
        <boxGeometry args={[0.4, ROOM_HEIGHT, 0.5]} />
        <primitive object={archMaterial} />
      </mesh>

      {/* Pilar Derecho */}
      <mesh position={[3.4, ROOM_HEIGHT / 2, z]} castShadow receiveShadow>
        <boxGeometry args={[0.4, ROOM_HEIGHT, 0.5]} />
        <primitive object={archMaterial} />
      </mesh>

      {/* Dintel Superior */}
      <mesh position={[0, ROOM_HEIGHT - 0.2, z]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 0.4, 0.5]} />
        <primitive object={archMaterial} />
      </mesh>

      {/* 2. TIRAS LED EMISIVAS SUTILES EN LOS BORDES INTERNOS */}
      {/* Borde LED Izquierdo */}
      <mesh position={[-3.21, openHeight / 2, z]}>
        <boxGeometry args={[0.02, openHeight, 0.51]} />
        <primitive object={ledMaterial} />
      </mesh>

      {/* Borde LED Derecho */}
      <mesh position={[3.21, openHeight / 2, z]}>
        <boxGeometry args={[0.02, openHeight, 0.51]} />
        <primitive object={ledMaterial} />
      </mesh>

      {/* Borde LED Superior */}
      <mesh position={[0, openHeight - 0.01, z]}>
        <boxGeometry args={[6.4, 0.02, 0.51]} />
        <primitive object={ledMaterial} />
      </mesh>

      {/* 3. BARRERA PREMIUM (CRISTAL INTELIGENTE TRANSLÚCIDO) */}
      {!isPremiumEnabled && (
        <group>
          {/* Panel de Vidrio Holográfico */}
          <mesh position={[0, openHeight / 2, z]} receiveShadow>
            <boxGeometry args={[6.38, openHeight, 0.04]} />
            <meshStandardMaterial
              color="#00a8ff"
              emissive="#004488"
              emissiveIntensity={1.2}
              transparent={true}
              opacity={0.3}
              roughness={0.05}
              metalness={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Destello de luz azul/dorado de la barrera */}
          <pointLight position={[0, openHeight / 2, z]} color="#00a8ff" intensity={1.5} distance={6.0} decay={2.0} />

          {/* Candado flotante */}
          <FloatingHoloLock z={z} />
        </group>
      )}
    </group>
  );
}
