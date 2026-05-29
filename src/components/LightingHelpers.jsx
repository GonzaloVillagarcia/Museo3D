import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// --- HAZ DE LUZ VOLUMÉTRICO PARA SCONCES Y PASILLO ---
export const VolumetricLightBeam = ({ active, ceilingHeight, maxOpacity = 0.38 }) => {
  const height = ceilingHeight - 1.8;
  const minOpacity = maxOpacity * 0.2;

  const shaderArgs = useMemo(() => ({
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
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

  return (
    <mesh position={[0, -0.142 - height / 2, 0]}>
      <coneGeometry args={[1.8, height, 32, 1, true]} />
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

// --- APLIQUE DE PARED BIDIRECCIONAL (SCONCE) CON SOPORTE DE ORIENTACIÓN ---
export const BidirectionalSconce = ({ position, hasLight = false, intensityScale = 1.0, wallType = 'side' }) => {
  const groupRef = useRef();
  const spotUp = useRef();
  const spotDown = useRef();

  useEffect(() => {
    if (groupRef.current && spotUp.current && spotDown.current) {
      const g = groupRef.current;
      spotUp.current.target.position.set(0, 5, 0);
      spotDown.current.target.position.set(0, -5, 0);
      g.add(spotUp.current.target);
      g.add(spotDown.current.target);
    }
  }, []);

  const mountPosition = useMemo(() => {
    if (wallType === 'side') {
      return [position[0] < 0 ? -0.04 : 0.04, 0, 0];
    } else if (wallType === 'front') {
      return [0, 0, 0.04];
    } else if (wallType === 'back') {
      return [0, 0, -0.04];
    }
    return [0, 0, 0];
  }, [position, wallType]);

  return (
    <group position={position} ref={groupRef}>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.32, 16]} />
        <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={mountPosition} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshStandardMaterial color="#151515" metalness={0.8} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.161, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.005, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -0.161, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.005, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {hasLight && (
        <>
          <spotLight
            ref={spotUp}
            position={[0, 0.16, 0]}
            angle={0.7}
            penumbra={0.5}
            intensity={25.0 * intensityScale}
            color="#ffffff"
            decay={1.3}
            distance={7}
            castShadow={false}
          />
          <spotLight
            ref={spotDown}
            position={[0, -0.16, 0]}
            angle={0.7}
            penumbra={0.5}
            intensity={45.0 * intensityScale}
            color="#ffffff"
            decay={1.3}
            distance={7}
            castShadow={false}
          />
        </>
      )}

      <group rotation={[Math.PI, 0, 0]} position={[0, 0.16, 0]}>
        <VolumetricLightBeam active={true} ceilingHeight={6.2 - 0.7} maxOpacity={0.10} />
      </group>
      <group position={[0, -0.16, 0]}>
        <VolumetricLightBeam active={true} ceilingHeight={3.9} maxOpacity={0.10} />
      </group>
    </group>
  );
};

// --- DICROICA DE PASILLO INDIVIDUAL ---
export const SingleCorridorLight = ({ z }) => {
  const lightRef = useRef();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (lightRef.current && target) {
      lightRef.current.target = target;
    }
  }, [target]);

  return (
    <group>
      <group position={[0, 6.2, z]}>
        <mesh position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.142, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <VolumetricLightBeam active={true} ceilingHeight={6.2 + 1.8} maxOpacity={0.11} />
      </group>
      <object3D ref={setTarget} position={[0, 0, z]} />
      <spotLight
        ref={lightRef}
        position={[0, 6.2 - 0.2, z]}
        angle={0.5}
        penumbra={0.7}
        intensity={170.0}
        color="#ffffff"
        decay={1.2}
        distance={13}
        castShadow={false}
      />
    </group>
  );
};

// --- SISTEMA DE ILUMINACIÓN SIMÉTRICO PARA EXTREMOS ---
export const SymmetricalEndLighting = ({ lightZ, targetZ, targetY, intensity = 35.0, angle = 0.38, castShadow = false }) => {
  const targetLeft = useRef();
  const targetRight = useRef();
  const spotLeft = useRef();
  const spotRight = useRef();

  useEffect(() => {
    if (spotLeft.current && targetLeft.current) {
      spotLeft.current.target = targetLeft.current;
    }
    if (spotRight.current && targetRight.current) {
      spotRight.current.target = targetRight.current;
    }
  }, []);

  return (
    <group>
      {/* Lámpara Izquierda */}
      <group position={[-1.8, 6.2, lightZ]} rotation={[0.3, -0.25, 0]}>
        <mesh position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.142, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      <object3D ref={targetLeft} position={[-0.8, targetY, targetZ]} />
      <spotLight
        ref={spotLeft}
        position={[-1.8, 6.2 - 0.2, lightZ]}
        angle={angle}
        penumbra={0.6}
        intensity={intensity}
        color="#ffffff"
        decay={1.2}
        distance={8}
        castShadow={castShadow}
      />

      {/* Lámpara Derecha */}
      <group position={[1.8, 6.2, lightZ]} rotation={[0.3, 0.25, 0]}>
        <mesh position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.142, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      <object3D ref={targetRight} position={[0.8, targetY, targetZ]} />
      <spotLight
        ref={spotRight}
        position={[1.8, 6.2 - 0.2, lightZ]}
        angle={angle}
        penumbra={0.6}
        intensity={intensity}
        color="#ffffff"
        decay={1.2}
        distance={8}
        castShadow={castShadow}
      />
    </group>
  );
};
