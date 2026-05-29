import React, { useMemo } from 'react';
import { useTexture, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { BidirectionalSconce, SingleCorridorLight } from './LightingHelpers';

const ROOM_HEIGHT = 5.8; // Techo más bajo para intimidad
const ROOM_WIDTH = 7.0;  // Más angosta y cuadrada
const ROOM_DEPTH = 10.0;

export default function RoomTwo() {
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

  // Proporciones de Room 2 (10m)
  const wallBrickNormal = useMemo(() => {
    const t = brickNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8.0, 2.8); t.needsUpdate = true; return t;
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

  // Coordenadas locales de Room 2 (Z entre -14.0 y -24.0, centro en Z = -19.0)
  const zCoords = [-16.5, -21.5];
  const sideSconceZCoords = [-16.5, -21.5];
  const coveLightZCoords = [-16.0, -22.0];

  return (
    <group>
      {/* PISO DE MICROCEMENTO REFLECTANTE (7.0m x 10m, centrado en Z = -19.0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -19.0]} receiveShadow>
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

      {/* CIELORRASO PLANO ELEVADO A Y = 5.8 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, -19.0]} receiveShadow>
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
        <group key={`cove-room2-${i}`}>
          <pointLight position={[-ROOM_WIDTH / 2 + 0.1, ROOM_HEIGHT - 0.05, zPos]} intensity={0.6} distance={12.0} decay={0.5} color="#ffffff" />
          <pointLight position={[ROOM_WIDTH / 2 - 0.1, ROOM_HEIGHT - 0.05, zPos]} intensity={0.6} distance={12.0} decay={0.5} color="#ffffff" />
        </group>
      ))}

      {/* PAREDES LATERALES */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -19.0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -19.0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* ==============================================================
          PARED FRONTAL DE SALA 2 (Z = -14.0) CON CUTOUT DE PUERTA (3.0m x 4.2m)
          ============================================================== */}
      {/* Panel Izquierdo */}
      <mesh position={[-2.5, ROOM_HEIGHT / 2, -14.0]} receiveShadow castShadow>
        <planeGeometry args={[2.0, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Panel Derecho */}
      <mesh position={[2.5, ROOM_HEIGHT / 2, -14.0]} receiveShadow castShadow>
        <planeGeometry args={[2.0, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Panel Superior / Dintel */}
      <mesh position={[0, 5.0, -14.0]} receiveShadow castShadow>
        <planeGeometry args={[3.0, 1.6]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* ==============================================================
          PARED TRASERA DE SALA 2 (Z = -24.0) CON CUTOUT DE PUERTA (2.2m x 3.5m)
          ============================================================== */}
      {/* Panel Izquierdo */}
      <mesh position={[-2.3, ROOM_HEIGHT / 2, -24.0]} receiveShadow castShadow>
        <planeGeometry args={[2.4, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Panel Derecho */}
      <mesh position={[2.3, ROOM_HEIGHT / 2, -24.0]} receiveShadow castShadow>
        <planeGeometry args={[2.4, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Panel Superior / Dintel */}
      <mesh position={[0, 4.65, -24.0]} receiveShadow castShadow>
        <planeGeometry args={[2.2, 2.3]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* RENDERIZADO DE LUCES LOCALES */}
      {zCoords.map((z, idx) => (
        <SingleCorridorLight key={`corr2-${idx}`} z={z} />
      ))}

      {sideSconceZCoords.map((z, idx) => (
        <group key={`sconces-room2-${idx}`}>
          <BidirectionalSconce position={[-ROOM_WIDTH / 2 + 0.08, 2.1, z]} hasLight={true} wallType="side" />
          <BidirectionalSconce position={[ROOM_WIDTH / 2 - 0.08, 2.1, z]} hasLight={true} wallType="side" />
        </group>
      ))}
    </group>
  );
}
