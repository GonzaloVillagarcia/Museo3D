import React from 'react';
import { Text } from '@react-three/drei';

export default function WallDecals() {
  const decalColor = "#2a2a2a";
  const decalSize = 0.6;
  const decalHeight = 5.2;

  return (
    <group>
      {/* Left Wall Decal */}
      <Text
        position={[-4.9, decalHeight, -10]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={decalSize}
        color={decalColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={8}
        textAlign="center"
      >
        Important all jersey in museum.
      </Text>

      {/* Right Wall Decal */}
      <Text
        position={[4.9, decalHeight, -10]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={decalSize}
        color={decalColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={8}
        textAlign="center"
      >
        Dedicated smart image content.
      </Text>
    </group>
  );
}
