import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- HOLOGRAPHIC PADLOCK FOR DOORWAYS ---
const FloatingHoloLock = ({ z, lockHeight = 2.0 }) => {
  const group = useRef();

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 1.2;
      group.current.position.y = lockHeight + Math.sin(state.clock.getElapsedTime() * 2.5) * 0.06;
    }
  });

  return (
    <group ref={group} position={[0, lockHeight, z]}>
      {/* Cuerpo del candado */}
      <mesh castShadow>
        <boxGeometry args={[0.26, 0.2, 0.09]} />
        <meshStandardMaterial
          color="#c8a853"
          emissive="#ffa800"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>

      {/* Arco del candado */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <torusGeometry args={[0.08, 0.018, 8, 24, Math.PI]} />
        <meshStandardMaterial
          color="#c8a853"
          emissive="#ffa800"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>

      {/* Cerradura */}
      <mesh position={[0, -0.015, 0.046]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.002, 16]} />
        <meshBasicMaterial color="#1a0b00" />
      </mesh>
      <mesh position={[0, -0.04, 0.046]}>
        <boxGeometry args={[0.012, 0.03, 0.002]} />
        <meshBasicMaterial color="#1a0b00" />
      </mesh>

      <pointLight color="#ffa800" intensity={3.0} distance={3.0} decay={2.0} />
    </group>
  );
};

export default function VIPBarrier({ z, width, height, isPremiumEnabled }) {
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: "#6b541d", // Bronce envejecido elegante
    metalness: 0.85,
    roughness: 0.25
  });

  const wallThickness = 0.4;
  const lockHeight = Math.min(2.2, height * 0.6); // Aliniado con la proporción de la puerta

  return (
    <group>
      {/* 1. MARCO METÁLICO DE LA PUERTA (JAMBS Y LINTEL) */}
      {/* Jamb Izquierda */}
      <mesh position={[-width / 2 - 0.025, height / 2, z]} castShadow receiveShadow>
        <boxGeometry args={[0.05, height, wallThickness]} />
        <primitive object={frameMaterial} />
      </mesh>

      {/* Jamb Derecha */}
      <mesh position={[width / 2 + 0.025, height / 2, z]} castShadow receiveShadow>
        <boxGeometry args={[0.05, height, wallThickness]} />
        <primitive object={frameMaterial} />
      </mesh>

      {/* Lintel Superior */}
      <mesh position={[0, height + 0.025, z]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.1, 0.05, wallThickness]} />
        <primitive object={frameMaterial} />
      </mesh>

      {/* 2. BARRERA DE CRISTAL ESMERILADO (SÓLO SI ESTÁ BLOQUEADO) */}
      {!isPremiumEnabled && (
        <group>
          {/* Panel de cristal con transmisión y refracción realista de Drei */}
          <mesh position={[0, height / 2, z]} receiveShadow>
            <boxGeometry args={[width, height, 0.04]} />
            <MeshTransmissionMaterial
              backside={true}
              thickness={0.25}
              roughness={0.45} // Nivel óptimo para efecto esmerilado que difumina el fondo
              transmission={0.65}
              ior={1.25}
              chromaticAberration={0.06}
              anisotropy={0.1}
              distortion={0.0}
              distortionScale={0.0}
              temporalDistortion={0.0}
              color="#00a8ff" // Tinte azul holográfico premium
            />
          </mesh>

          {/* Luz interna de la barrera de cristal */}
          <pointLight position={[0, height / 2, z]} color="#00a8ff" intensity={1.8} distance={6.0} decay={2.0} />

          {/* Candado flotante */}
          <FloatingHoloLock z={z} lockHeight={lockHeight} />
        </group>
      )}
    </group>
  );
}
