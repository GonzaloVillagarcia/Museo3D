import React, { useMemo } from 'react';
import { useTexture, Text, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { BidirectionalSconce, SingleCorridorLight, SymmetricalEndLighting } from './LightingHelpers';

const ROOM_HEIGHT = 6.8; // Techo más alto para el Altar Final / Dioses
const ROOM_WIDTH = 10.0; // Sala más ancha e imponente
const ROOM_DEPTH = 10.0;

export default function RoomThree({ title, subtitle, desc }) {
  // Texturas de Cielorraso (Road013A)
  const [ceilingColor, ceilingNormal, ceilingRough, ceilingAO] = useTexture([
    '/Road013A_4K-JPG_Color.jpg',
    '/Road013A_4K-JPG_NormalGL.jpg',
    '/Road013A_4K-JPG_Roughness.jpg',
    '/Road013A_4K-JPG_AmbientOcclusion.jpg'
  ]);

  // Texturas de Piso (Concrete033)
  const [concreteColor, concreteNormal, concreteRough, concreteAO] = useTexture([
    '/Concrete033_4K-JPG_Color.jpg',
    '/Concrete033_4K-JPG_NormalGL.jpg',
    '/Concrete033_4K-JPG_Roughness.jpg',
    '/Concrete033_4K-JPG_AmbientOcclusion.jpg'
  ]);

  // Texturas de Paredes (Bricks058)
  const [brickColor, brickNormal, brickRough, brickAO] = useTexture([
    '/Bricks058_4K-JPG_Color.jpg',
    '/Bricks058_4K-JPG_NormalGL.jpg',
    '/Bricks058_4K-JPG_Roughness.jpg',
    '/Bricks058_4K-JPG_AmbientOcclusion.jpg'
  ]);

  // Proporciones de Room 3 (10m)
  const wallBrickNormal = useMemo(() => {
    const t = brickNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8.0, 3.2); t.needsUpdate = true; return t;
  }, [brickNormal]);

  const [ceilingColorTex, ceilingNormalTex, ceilingRoughTex, ceilingAOTex] = useMemo(() => {
    const color = ceilingColor.clone();
    const normal = ceilingNormal.clone();
    const rough = ceilingRough.clone();
    const ao = ceilingAO.clone();
    [color, normal, rough, ao].forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(4, 4);
      t.needsUpdate = true;
    });
    return [color, normal, rough, ao];
  }, [ceilingColor, ceilingNormal, ceilingRough, ceilingAO]);

  const [floorColorTex, floorNormalTex, floorRoughTex, floorAOTex] = useMemo(() => {
    const color = concreteColor.clone();
    const normal = concreteNormal.clone();
    const rough = concreteRough.clone();
    const ao = concreteAO.clone();
    [color, normal, rough, ao].forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(4, 4);
      t.needsUpdate = true;
    });
    return [color, normal, rough, ao];
  }, [concreteColor, concreteNormal, concreteRough, concreteAO]);

  const sideWallMaterialProps = {
    normalMap: wallBrickNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    color: "#1c1c1c",
    specular: "#000000",
    shininess: 30
  };

  // Coordenadas locales de Room 3 (Z entre -24.0 y -34.0, centro en Z = -29.0)
  const zCoords = [-26.5, -31.5];
  const sideSconceZCoords = [-26.5, -31.5];
  const coveLightZCoords = [-26.0, -32.0];

  return (
    <group>
      {/* PISO DE MICROCEMENTO REFLECTANTE (10m x 10m, centrado en Z = -29.0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -29.0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={45}
          roughness={0.7}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.6}
          map={floorColorTex}
          normalMap={floorNormalTex}
          roughnessMap={floorRoughTex}
          aoMap={floorAOTex}
        />
      </mesh>

      {/* CIELORRASO PLANO ELEVADO A Y = 6.8 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, -29.0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial
          map={ceilingColorTex}
          normalMap={ceilingNormalTex}
          roughnessMap={ceilingRoughTex}
          aoMap={ceilingAOTex}
          color="#a0a0a0"
          roughness={0.9}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* COVE LIGHTS */}
      {coveLightZCoords.map((zPos, i) => (
        <group key={`cove-room3-${i}`}>
          <pointLight position={[-ROOM_WIDTH / 2 + 0.1, ROOM_HEIGHT - 0.05, zPos]} intensity={0.6} distance={15.0} decay={0.5} color="#ffffff" />
          <pointLight position={[ROOM_WIDTH / 2 - 0.1, ROOM_HEIGHT - 0.05, zPos]} intensity={0.6} distance={15.0} decay={0.5} color="#ffffff" />
        </group>
      ))}

      {/* PAREDES LATERALES */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -29.0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -29.0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* ==============================================================
          PARED FRONTAL DE SALA 3 (Z = -24.0) CON CUTOUT DE PUERTA (2.2m x 3.5m)
          ============================================================== */}
      {/* Panel Izquierdo */}
      <mesh position={[-3.05, ROOM_HEIGHT / 2, -24.0]} receiveShadow castShadow>
        <planeGeometry args={[3.9, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Panel Derecho */}
      <mesh position={[3.05, ROOM_HEIGHT / 2, -24.0]} receiveShadow castShadow>
        <planeGeometry args={[3.9, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Panel Superior / Dintel */}
      <mesh position={[0, 5.15, -24.0]} receiveShadow castShadow>
        <planeGeometry args={[2.2, 3.3]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* ==============================================================
          PARED TRASERA DE CIERRE ABSOLUTO (Z = -34.0) CON CARTEL
          ============================================================== */}
      <mesh position={[0, ROOM_HEIGHT / 2, -34.0]} receiveShadow castShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Cartel Dinámico de Texto */}
      <group position={[0, 4.8, -33.95]}>
        <Text
          fontSize={0.26}
          color="#c8a853"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
        <Text
          fontSize={0.12}
          color="#ffffff"
          position={[0, -0.32, 0]}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          {subtitle}
        </Text>
        <Text
          fontSize={0.068}
          color="#aaaaaa"
          position={[0, -0.68, 0]}
          anchorX="center"
          anchorY="middle"
          maxWidth={5.2}
          textAlign="center"
          lineHeight={1.6}
        >
          {desc}
        </Text>
      </group>

      {/* ILUMINACIÓN CENITAL SIMÉTRICA DEL CARTEL DEL FONDO */}
      <SymmetricalEndLighting lightZ={-29.2} targetZ={-33.95} targetY={4.8} intensity={35.0} angle={0.38} castShadow={false} />

      {/* APLIQUES A LOS LADOS DEL CARTEL */}
      <BidirectionalSconce position={[-3.2, 2.1, -33.92]} hasLight={true} intensityScale={1.5} wallType="back" />
      <BidirectionalSconce position={[3.2, 2.1, -33.92]} hasLight={true} intensityScale={1.5} wallType="back" />

      {/* RENDERIZADO DE LUCES LOCALES */}
      {zCoords.map((z, idx) => (
        <SingleCorridorLight key={`corr3-${idx}`} z={z} />
      ))}

      {sideSconceZCoords.map((z, idx) => (
        <group key={`sconces-room3-${idx}`}>
          <BidirectionalSconce position={[-ROOM_WIDTH / 2 + 0.08, 2.1, z]} hasLight={true} wallType="side" />
          <BidirectionalSconce position={[ROOM_WIDTH / 2 - 0.08, 2.1, z]} hasLight={true} wallType="side" />
        </group>
      ))}
    </group>
  );
}
