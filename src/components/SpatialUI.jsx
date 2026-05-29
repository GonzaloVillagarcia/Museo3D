import React, { useRef } from 'react';
import { Text, RoundedBox, Edges, Float, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlowingRing = ({ position }) => {
  return (
    <group position={position}>
      {/* Inner ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.4, 1.45, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.9} toneMapped={false} />
      </mesh>
      {/* Middle ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.65, 1.68, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      {/* Outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.9, 1.92, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.2} toneMapped={false} />
      </mesh>
    </group>
  );
};

const NavigationPanel = ({ position }) => {
  return (
    <group position={position}>
      {/* Glowing Frame */}
      <RoundedBox args={[6, 2.5, 0.05]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.1} depthWrite={false} />
        <Edges
          linewidth={2}
          threshold={15}
          color="#00e5ff"
        />
      </RoundedBox>

      {/* Main Title */}
      <Text position={[0, 0.8, 0.05]} fontSize={0.25} color="#00e5ff" anchorX="center" anchorY="middle" toneMapped={false}>
        Museum navigation
      </Text>

      {/* Separator Line */}
      <mesh position={[0, -0.2, 0.05]}>
        <boxGeometry args={[0.02, 1.5, 0.01]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>

      {/* Left Section */}
      <Text position={[-1.5, -0.1, 0.05]} fontSize={0.22} color="#ffffff" anchorX="center" anchorY="middle">
        Sola Izquierda
      </Text>
      <Text position={[-2.2, -0.6, 0.05]} fontSize={0.4} color="#00e5ff" anchorX="center" anchorY="middle" toneMapped={false}>
        {"<-"}
      </Text>
      <Text position={[-0.8, -0.6, 0.05]} fontSize={0.4} color="#00e5ff" anchorX="center" anchorY="middle" toneMapped={false}>
        👤
      </Text>

      {/* Right Section */}
      <Text position={[1.5, -0.1, 0.05]} fontSize={0.22} color="#ffffff" anchorX="center" anchorY="middle">
        Sola Derecha
      </Text>
      <Text position={[2.2, -0.6, 0.05]} fontSize={0.4} color="#00e5ff" anchorX="center" anchorY="middle" toneMapped={false}>
        {"->"}
      </Text>
      <Text position={[0.8, -0.6, 0.05]} fontSize={0.4} color="#00e5ff" anchorX="center" anchorY="middle" toneMapped={false}>
        👤
      </Text>
    </group>
  );
};

const ObjectMenu = ({ position }) => {
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
      <group position={position}>
        {/* Lock Icon Circle */}
        <group position={[-1.2, 1.5, 0]}>
          <mesh>
            <ringGeometry args={[0.25, 0.3, 32]} />
            <meshBasicMaterial color="#00e5ff" toneMapped={false} />
          </mesh>
          <Text position={[0, 0, 0]} fontSize={0.3} color="#00e5ff" anchorX="center" anchorY="middle" toneMapped={false}>
            🔒
          </Text>
        </group>

        {/* Info Panel Line Connector */}
        <mesh position={[-0.5, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[1.5, 0.02, 0.01]} />
          <meshBasicMaterial color="#00e5ff" toneMapped={false} />
        </mesh>

        {/* Info Panel Frame */}
        <RoundedBox args={[2.0, 2.5, 0.02]} radius={0.05} smoothness={4} position={[1, 0, 0]}>
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.1} depthWrite={false} />
          <Edges
            linewidth={2}
            threshold={15}
            color="#00e5ff"
          />
        </RoundedBox>

        {/* Info Panel Text */}
        <group position={[0.2, 1.0, 0.02]}>
          <Text position={[0, 0, 0]} fontSize={0.15} color="#ffffff" anchorX="left" anchorY="top">
            Description
          </Text>
          <Text position={[0, -0.25, 0]} fontSize={0.15} color="#ffffff" anchorX="left" anchorY="top">
            Origin
          </Text>
          <Text position={[0, -0.5, 0]} fontSize={0.15} color="#ffffff" anchorX="left" anchorY="top">
            History
          </Text>
          <Text position={[0, -0.75, 0]} fontSize={0.15} color="#ffffff" anchorX="left" anchorY="top">
            Material
          </Text>
          
          {/* Mock lines */}
          <mesh position={[0.8, -1.2, 0]}>
            <planeGeometry args={[1.6, 0.8]} />
            <meshBasicMaterial color="#00aaff" transparent opacity={0.3} />
          </mesh>
        </group>
      </group>
    </Float>
  );
};

export { GlowingRing, NavigationPanel, ObjectMenu };
