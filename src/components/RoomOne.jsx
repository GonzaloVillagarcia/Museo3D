import React, { useState, useMemo } from 'react';
import { useTexture, Text, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { BidirectionalSconce, SingleCorridorLight, SymmetricalEndLighting } from './LightingHelpers';

const ROOM_HEIGHT = 6.2;
const ROOM_WIDTH = 11.5;
const ROOM_DEPTH = 18.0;

export default function RoomOne() {
  const distefanoTex = useTexture('/foto1.jpg');
  const [portraitTarget, setPortraitTarget] = useState(null);

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

  // Proporciones de texturas específicas de Room 1 (18m)
  const wallBrickNormal = useMemo(() => {
    const t = brickNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14.4, 3); t.needsUpdate = true; return t;
  }, [brickNormal]);

  const [ceilingColorTex, ceilingNormalTex, ceilingRoughTex, ceilingAOTex] = useMemo(() => {
    const color = ceilingColor.clone();
    const normal = ceilingNormal.clone();
    const rough = ceilingRough.clone();
    const ao = ceilingAO.clone();
    [color, normal, rough, ao].forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(4, 6);
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
      t.repeat.set(4, 6);
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

  // Coordenadas locales de Room 1 (Centro Z = -5.0)
  const zCoords = [2.25, -2.25, -6.75, -11.25];
  const sideSconceZCoords = [-0.75, -5.25, -9.75];
  const coveLightZCoords = [2.0, -4.0, -10.0];

  return (
    <group>
      {/* PISO DE MICROCEMENTO REFLECTANTE (11.5m x 18m, centrado en Z = -5.0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5.0]} receiveShadow>
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

      {/* CIELORRASO FLOTANTE DE CONCRETO */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, -5.0]} receiveShadow>
        <planeGeometry args={[6.4, ROOM_DEPTH]} />
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

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-4.475, ROOM_HEIGHT - 0.4, -5.0]} receiveShadow>
        <planeGeometry args={[2.55, ROOM_DEPTH]} />
        <meshStandardMaterial
          map={ceilingColorTex}
          normalMap={ceilingNormalTex}
          roughnessMap={ceilingRoughTex}
          aoMap={ceilingAOTex}
          color="#8c8c8c"
          roughness={0.9}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[4.475, ROOM_HEIGHT - 0.4, -5.0]} receiveShadow>
        <planeGeometry args={[2.55, ROOM_DEPTH]} />
        <meshStandardMaterial
          map={ceilingColorTex}
          normalMap={ceilingNormalTex}
          roughnessMap={ceilingRoughTex}
          aoMap={ceilingAOTex}
          color="#8c8c8c"
          roughness={0.9}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-3.2, ROOM_HEIGHT - 0.2, -5.0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <planeGeometry args={[ROOM_DEPTH, 0.4]} />
        <meshStandardMaterial
          map={ceilingColorTex}
          normalMap={ceilingNormalTex}
          color="#8c8c8c"
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[3.2, ROOM_HEIGHT - 0.2, -5.0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
        <planeGeometry args={[ROOM_DEPTH, 0.4]} />
        <meshStandardMaterial
          map={ceilingColorTex}
          normalMap={ceilingNormalTex}
          color="#8c8c8c"
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* COVE LIGHTS */}
      {coveLightZCoords.map((zPos, i) => (
        <group key={`cove-room1-${i}`}>
          <pointLight position={[-3.18, ROOM_HEIGHT - 0.05, zPos]} intensity={0.6} distance={16.0} decay={0.5} color="#ffffff" />
          <pointLight position={[3.18, ROOM_HEIGHT - 0.05, zPos]} intensity={0.6} distance={16.0} decay={0.5} color="#ffffff" />
        </group>
      ))}

      {/* PAREDES LATERALES */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -5.0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -5.0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* PARED DE ENTRADA (Z = 4.0) */}
      <mesh position={[0, ROOM_HEIGHT / 2, 4.0]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* PILARES Y PORTARRETRATO EN LA ENTRADA */}
      <mesh position={[-3.8, ROOM_HEIGHT / 2, 3.8]} receiveShadow castShadow>
        <boxGeometry args={[0.8, ROOM_HEIGHT, 0.4]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>
      <mesh position={[3.8, ROOM_HEIGHT / 2, 3.8]} receiveShadow castShadow>
        <boxGeometry args={[0.8, ROOM_HEIGHT, 0.4]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      <mesh position={[0, 2.3, 3.98]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 3.8, 0.05]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.15} metalness={0.8} />
      </mesh>
      <group>
        <mesh position={[0, 2.3, 3.95]} castShadow receiveShadow>
          <boxGeometry args={[5.0, 3.4, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.75} metalness={0.1} />
        </mesh>
        <mesh position={[0, 2.3, 3.89]} castShadow>
          <boxGeometry args={[4.88, 3.28, 0.04]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 2.3, 3.85]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
          <planeGeometry args={[4.8, 3.2]} />
          <meshStandardMaterial map={distefanoTex} roughness={0.5} metalness={0.05} />
        </mesh>
      </group>
      <Text
        position={[0, 4.4, 3.92]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.32}
        color="#c8a853"
        anchorX="center"
        anchorY="middle"
      >
        LA SAETA RUBIA
      </Text>

      {/* ILUMINACIÓN CENITAL SIMÉTRICA DEL RETRATO */}
      <SymmetricalEndLighting lightZ={1.8} targetZ={3.85} targetY={2.3} intensity={18.0} angle={0.45} castShadow={true} />

      {/* APLIQUES A LOS LADOS DEL CUADRO */}
      <BidirectionalSconce position={[-3.2, 2.1, 3.92]} hasLight={true} intensityScale={1.5} wallType="front" />
      <BidirectionalSconce position={[3.2, 2.1, 3.92]} hasLight={true} intensityScale={1.5} wallType="front" />

      {/* ==============================================================
          PARED DE FONDO DE SALA 1 (Z = -14.0) CON CUTOUT DE PUERTA (3.0m x 4.2m)
          ============================================================== */}
      {/* Panel Izquierdo */}
      <mesh position={[-3.625, ROOM_HEIGHT / 2, -14.0]} receiveShadow castShadow>
        <planeGeometry args={[4.25, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Panel Derecho */}
      <mesh position={[3.625, ROOM_HEIGHT / 2, -14.0]} receiveShadow castShadow>
        <planeGeometry args={[4.25, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Panel Superior / Dintel */}
      <mesh position={[0, 5.2, -14.0]} receiveShadow castShadow>
        <planeGeometry args={[3.0, 2.0]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* RENDERIZADO DE LUCES LOCALES */}
      {zCoords.map((z, idx) => (
        <SingleCorridorLight key={`corr1-${idx}`} z={z} />
      ))}

      {sideSconceZCoords.map((z, idx) => (
        <group key={`sconces-room1-${idx}`}>
          <BidirectionalSconce position={[-5.67, 2.1, z]} hasLight={true} wallType="side" />
          <BidirectionalSconce position={[5.67, 2.1, z]} hasLight={true} wallType="side" />
        </group>
      ))}
    </group>
  );
}
