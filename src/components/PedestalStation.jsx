import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center, Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const ROOM_HEIGHT = 6.0;

// --- LUMINARIA DICROICA FÍSICA ---
const CeilingFixture = ({ active }) => {
  return (
    <group>
      {/* Cuerpo cilíndrico colgante negro mate */}
      <mesh castShadow={false} position={[0, -0.075, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
        <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
      </mesh>
      {/* Lente encendida integrada en la boca del cilindro */}
      <mesh position={[0, -0.142, 0]}>
        <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
        <meshBasicMaterial color={active ? "#ffffff" : "#444444"} />
      </mesh>
    </group>
  );
};

// --- HAZ DE LUZ VOLUMÉTRICO ---
const VolumetricLightBeam = ({ active, ceilingHeight, maxOpacity = 0.35 }) => {
  const height = ceilingHeight - 1.2;
  const minOpacity = maxOpacity * 0.15;

  const shaderArgs = useMemo(() => ({
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      uniform vec3 color;
      uniform float opacity;
      void main() {
        vec3 normalVec = normalize(vNormal);
        vec3 viewVec = normalize(vViewPosition);
        float fresnel = clamp(dot(normalVec, viewVec), 0.0, 1.0);
        float softEdge = pow(fresnel, 4.0);
        float verticalFade = pow(vUv.y, 2.0);
        gl_FragColor = vec4(color, softEdge * verticalFade * opacity);
      }
    `,
    uniforms: {
      color: { value: new THREE.Color("#ffffff") },
      opacity: { value: active ? maxOpacity : minOpacity }
    }
  }), [active, maxOpacity, minOpacity]);

  useEffect(() => {
    shaderArgs.uniforms.opacity.value = active ? maxOpacity : minOpacity;
  }, [active, maxOpacity, minOpacity, shaderArgs]);

  return (
    <mesh position={[0, -0.142 - height / 2, 0]}>
      <coneGeometry args={[1.2, height, 32, 1, true]} />
      <shaderMaterial
        args={[shaderArgs]}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// --- AROS LED AZULES EN EL PISO ---
const GlowRings = ({ active }) => {
  return (
    <group position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Anillo Interno */}
      <mesh>
        <ringGeometry args={[0.85, 0.87, 64]} />
        <meshBasicMaterial color={active ? [0, 2, 4] : [0, 0.4, 0.8]} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      {/* Anillo Externo */}
      <mesh>
        <ringGeometry args={[1.15, 1.17, 64]} />
        <meshBasicMaterial color={active ? [0, 1.5, 3] : [0, 0.3, 0.6]} toneMapped={false} transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

// --- MODELO GLTF DE LA CAMISETA ---
const JerseyModel = ({ active, initialRotY = 0, color }) => {
  const { scene } = useGLTF('/camiseta.glb');
  const group = useRef();
  const clonedScene = useMemo(() => {
    const s = scene.clone();
    s.traverse((o) => { 
      if (o.isMesh) { 
        o.castShadow = true; 
        o.receiveShadow = true; 
        if (color) {
          o.material = o.material.clone();
          o.material.color.set(color);
        }
      } 
    });
    return s;
  }, [scene, color]);

  useEffect(() => {
    if (group.current) {
      group.current.rotation.y = initialRotY;
    }
  }, [initialRotY]);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * (active ? 0.6 : 0.2);
    }
  });

  return (
    <Float speed={active ? 2 : 1} rotationIntensity={0.15} floatIntensity={0.08}>
      <group position={[0, 1.8, 0]} ref={group}>
        <Center><primitive object={clonedScene} scale={1.3} /></Center>
      </group>
    </Float>
  );
};

export default function PedestalStation({ exhibit, isActive, onSelect }) {
  const actualCeilingHeight = ROOM_HEIGHT - 0.4;
  const ceilingLightPos = [exhibit.pos[0], actualCeilingHeight, exhibit.pos[2]];
  const spotAngle = 0.25;

  const lightRef = useRef();
  const [localTarget, setLocalTarget] = useState(null);

  // Carga de texturas para pedestales
  const metalTextures = useTexture({
    map: '/Metal048C_4K-JPG_Color.jpg',
    normalMap: '/Metal048C_4K-JPG_NormalGL.jpg',
    roughnessMap: '/Metal048C_4K-JPG_Roughness.jpg'
  });

  const concreteTextures = useTexture({
    map: '/Road013A_4K-JPG_Color.jpg',
    normalMap: '/Road013A_4K-JPG_NormalGL.jpg',
    roughnessMap: '/Road013A_4K-JPG_Roughness.jpg'
  });

  useFrame((state, delta) => {
    if (lightRef.current) {
      const targetIntensity = isActive ? 35 : 10;
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetIntensity, delta * 6);
    }
  });

  return (
    <group>
      {/* Aros LED de navegación */}
      <group position={exhibit.pos}>
        <GlowRings active={isActive} />
      </group>

      {/* BASE DORADA DEL PEDESTAL */}
      <mesh
        position={[exhibit.pos[0], exhibit.pos[1] + 0.05, exhibit.pos[2]]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.2, 0.1, 1.2]} />
        <meshStandardMaterial
          map={metalTextures.map}
          normalMap={metalTextures.normalMap}
          roughnessMap={metalTextures.roughnessMap}
          color="#D4AF37"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* CUBO NEGRO MATE DEL PEDESTAL */}
      <mesh
        position={[exhibit.pos[0], exhibit.pos[1] + 0.65, exhibit.pos[2]]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[1.15, 1.1, 1.15]} />
        <meshStandardMaterial
          map={concreteTextures.map}
          normalMap={concreteTextures.normalMap}
          color="#121212"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* RENDERIZADO DEL MODELO (CAMISETA) */}
      <group
        position={exhibit.pos}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'default';
        }}
      >
        <Suspense fallback={null}>
          <JerseyModel active={isActive} initialRotY={exhibit.initialRotY} color={exhibit.color} />
        </Suspense>
      </group>

      {/* ILUMINACIÓN CENITAL Y HAZ VOLUMÉTRICO DEL PEDESTAL */}
      <group position={ceilingLightPos}>
        <CeilingFixture active={isActive} />
        <VolumetricLightBeam active={isActive} ceilingHeight={actualCeilingHeight} />

        <object3D ref={setLocalTarget} position={[0, -10, 0]} />

        <spotLight
          ref={lightRef}
          position={[0, -0.15, 0]}
          target={localTarget}
          angle={spotAngle}
          penumbra={0.3}
          intensity={10}
          color="#ffffff"
          decay={1.2}
          distance={15}
          castShadow={true}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0005}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/camiseta.glb');
