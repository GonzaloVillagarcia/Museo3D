import React from 'react';
import { useTexture, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ROOM_HEIGHT = 6.0;

export default function TShapeGallery() {
  const concreteTexOrig = useTexture('/Road013A_4K-JPG_Color.jpg');
  concreteTexOrig.wrapS = THREE.RepeatWrapping;
  concreteTexOrig.wrapT = THREE.RepeatWrapping;
  concreteTexOrig.repeat.set(8, 8);

  return (
    <group>
      {/* Ambient and Hemisphere light to softly illuminate the dark walls and ceiling */}
      <ambientLight intensity={1.5} color="#ffffff" />
      <hemisphereLight skyColor="#888888" groundColor="#222222" intensity={1.5} />

      {/* Floor - Polished dark grey microcement with high reflectivity */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]}>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial 
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={80}
          roughness={0.15}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.5}
        />
      </mesh>

      {/* Ceiling - Raw textured concrete */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, -10]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial map={concreteTexOrig} color="#777777" roughness={0.9} />
      </mesh>

      {/* Walls - Smooth dark grey/carbon black matte */}
      {/* Central Hall Back Wall (Z = -15), from X=-5 to X=5 */}
      <mesh position={[0, ROOM_HEIGHT/2, -15]}>
        <boxGeometry args={[10, ROOM_HEIGHT, 0.5]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
      
      {/* Central Hall Left Wall (X = -5), Z from 5 to -10 */}
      <mesh position={[-5, ROOM_HEIGHT/2, -2.5]}>
        <boxGeometry args={[0.5, ROOM_HEIGHT, 15]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>

      {/* Central Hall Right Wall (X = 5), Z from 5 to -10 */}
      <mesh position={[5, ROOM_HEIGHT/2, -2.5]}>
        <boxGeometry args={[0.5, ROOM_HEIGHT, 15]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
      
      {/* Left Gallery Walls */}
      {/* Back Wall (Z = -15) */}
      <mesh position={[-22.5, ROOM_HEIGHT/2, -15]}>
        <boxGeometry args={[35, ROOM_HEIGHT, 0.5]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
      {/* Front Wall (Z = -10) */}
      <mesh position={[-22.5, ROOM_HEIGHT/2, -10]}>
        <boxGeometry args={[35, ROOM_HEIGHT, 0.5]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
      {/* End Wall (X = -40) */}
      <mesh position={[-40, ROOM_HEIGHT/2, -12.5]}>
        <boxGeometry args={[0.5, ROOM_HEIGHT, 5]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>

      {/* Right Gallery Walls */}
      {/* Back Wall (Z = -15) */}
      <mesh position={[22.5, ROOM_HEIGHT/2, -15]}>
        <boxGeometry args={[35, ROOM_HEIGHT, 0.5]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
      {/* Front Wall (Z = -10) */}
      <mesh position={[22.5, ROOM_HEIGHT/2, -10]}>
        <boxGeometry args={[35, ROOM_HEIGHT, 0.5]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
      {/* End Wall (X = 40) */}
      <mesh position={[40, ROOM_HEIGHT/2, -12.5]}>
        <boxGeometry args={[0.5, ROOM_HEIGHT, 5]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>

      {/* Ceiling Track Lights (visual only) */}
      <mesh position={[-2.5, ROOM_HEIGHT - 0.1, -12]}>
        <boxGeometry args={[0.2, 0.2, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[2.5, ROOM_HEIGHT - 0.1, -12]}>
        <boxGeometry args={[0.2, 0.2, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}
