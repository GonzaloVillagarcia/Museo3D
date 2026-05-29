import React, { useRef, useState, useEffect, Suspense, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  useTexture,
  Html,
  useProgress,
  Center,
  OrbitControls,
  Float,
  Text,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// --- CONFIGURACIÓN DE LA BÓVEDA ---
const ROOM_DEPTH = 38;
const ROOM_WIDTH = 11.5; // La habitación es más angosta, idéntica a la referencia de museo
const ROOM_HEIGHT = 6.2;

const DUMMY_TEXT = "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

const EXHIBITS = [
  // LADO IZQUIERDO (Alineación regular en Z, traídos más al centro debido al ancho de 11.5m)
  { id: 0, title: "LA LLEGADA", year: "1953", desc: DUMMY_TEXT, type: 'regular', pos: [-5.1, 0, -7.5], camPos: [-1.8, 3.2, -7.5], textPos: [-5.67, 4.2, -7.5], rotY: Math.PI / 2, isLeft: true, initialRotY: Math.PI / 2 },
  { id: 1, title: "EL DOBLETE", year: "1957", desc: DUMMY_TEXT, type: 'regular', pos: [-5.1, 0, -12.0], camPos: [-1.8, 3.2, -12.0], textPos: [-5.67, 4.2, -12.0], rotY: Math.PI / 2, isLeft: true, initialRotY: Math.PI / 2 },
  { id: 2, title: "LA QUINTA", year: "1960", desc: DUMMY_TEXT, type: 'regular', pos: [-5.1, 0, -16.5], camPos: [-1.8, 3.2, -16.5], textPos: [-5.67, 4.2, -16.5], rotY: Math.PI / 2, isLeft: true, initialRotY: Math.PI / 2 },

  // LADO DERECHO (Alineación regular en Z)
  { id: 3, title: "LA PRIMERA", year: "1956", desc: DUMMY_TEXT, type: 'regular', pos: [5.1, 0, -7.5], camPos: [1.8, 3.2, -7.5], textPos: [5.67, 4.2, -7.5], rotY: -Math.PI / 2, isLeft: false, initialRotY: -Math.PI / 2 },
  { id: 4, title: "LA TERCERA", year: "1958", desc: DUMMY_TEXT, type: 'regular', pos: [5.1, 0, -12.0], camPos: [1.8, 3.2, -12.0], textPos: [5.67, 4.2, -12.0], rotY: -Math.PI / 2, isLeft: false, initialRotY: -Math.PI / 2 },
  { id: 5, title: "LA CUARTA", year: "1959", desc: DUMMY_TEXT, type: 'regular', pos: [5.1, 0, -16.5], camPos: [1.8, 3.2, -16.5], textPos: [5.67, 4.2, -16.5], rotY: -Math.PI / 2, isLeft: false, initialRotY: -Math.PI / 2 },

  // ALTAR CENTRAL (Atriles despegados de la pared a Z = -20.1, espaciados un poco más a 1.75m y traídos más cerca)
  { id: 6, title: "BALÓN DE ORO", year: "1957", desc: DUMMY_TEXT, type: 'premium', pos: [-1.75, 1.2, -20.1], camPos: [-1.75, 3.2, -15.9], rotY: 0, isCenter: true, initialRotY: 0 },
  { id: 7, title: "SÚPER BALÓN", year: "1989", desc: DUMMY_TEXT, type: 'premium', pos: [0.0, 1.2, -20.1], camPos: [0.0, 3.2, -15.9], rotY: 0, isCenter: true, initialRotY: 0 },
  { id: 8, title: "BALÓN DE ORO", year: "1959", desc: DUMMY_TEXT, type: 'premium', pos: [1.75, 1.2, -20.1], camPos: [1.75, 3.2, -15.9], rotY: 0, isCenter: true, initialRotY: 0 },
];

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: '#D4AF37', fontSize: '14px', letterSpacing: '8px', fontFamily: 'serif', background: 'rgba(0,0,0,0.9)', padding: '25px', borderRadius: '8px', border: '1px solid #D4AF37', textAlign: 'center', minWidth: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        CARGANDO BÓVEDA REALISTA<br />
        <div style={{ width: '100%', height: '3px', background: '#222', marginTop: '15px', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#D4AF37', transition: 'width 0.2s ease-out' }}></div>
        </div>
        <span style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '10px', display: 'inline-block' }}>{progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
}

// --- LUMINARIA DICROICA FÍSICA ---
const CeilingFixture = ({ active }) => {
  return (
    <group>
      {/* Cuerpo cilíndrico colgante muy elegante, corto y compacto negro mate */}
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

// --- SIMULADOR DE HAZ DE LUZ VOLUMÉTRICO ---
const VolumetricLightBeam = ({ active, ceilingHeight, maxOpacity = 0.38 }) => {
  const height = ceilingHeight - 1.8; // Altura dinámica basada en el cielorraso real
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
      color: { value: new THREE.Color("#ffffff") }, // Luz blanca pura, cero tintes cálidos
      opacity: { value: active ? maxOpacity : minOpacity }
    }
  }), [active, maxOpacity, minOpacity]);

  useEffect(() => {
    shaderArgs.uniforms.opacity.value = active ? maxOpacity : minOpacity;
  }, [active, maxOpacity, minOpacity, shaderArgs]);

  return (
    // Se posiciona exactamente en la punta de la dicroica corta en espacio local del grupo rotado
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



// --- MATERIALES GLOBALES COMPARTIDOS PARA TEXTOS REALISTAS CON SOMBRAS ---
const GOLD_TEXT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#c8a853",
  roughness: 0.4,
  metalness: 0.6
});

const WHITE_TEXT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 0.5,
  metalness: 0.1
});

const GREY_TEXT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#aaaaaa",
  roughness: 0.6,
  metalness: 0.0
});

const PORTRAIT_TEXT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#bfa043",
  roughness: 0.4,
  metalness: 0.5
});

// --- ARQUITECTURA ELEGANTE DE CONCRETO CON SALA CONTIGUA ---
const MuseumRoom = () => {
  const distefanoTex = useTexture('/foto1.jpg');
  const [portraitTarget, setPortraitTarget] = useState(null);

  const [woodColor, woodNormal, woodRough] = useTexture([
    '/Wood089_4K-JPG_Color.jpg',
    '/Wood089_4K-JPG_NormalGL.jpg',
    '/Wood089_4K-JPG_Roughness.jpg'
  ]);

  const [concreteColor, concreteNormal, concreteRough, concreteAO] = useTexture([
    '/Concrete033_4K-JPG_Color.jpg',
    '/Concrete033_4K-JPG_NormalGL.jpg',
    '/Concrete033_4K-JPG_Roughness.jpg',
    '/Concrete033_4K-JPG_AmbientOcclusion.jpg'
  ]);

  const [brickColor, brickNormal, brickRough, brickAO] = useTexture([
    '/Bricks058_4K-JPG_Color.jpg',
    '/Bricks058_4K-JPG_NormalGL.jpg',
    '/Bricks058_4K-JPG_Roughness.jpg',
    '/Bricks058_4K-JPG_AmbientOcclusion.jpg'
  ]);

  // Ladrillos de paredes principales laterales (Copiada escala del Santuario para consistencia mate)
  const wallBrickColor = useMemo(() => {
    const t = brickColor.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(55, 3); t.needsUpdate = true; return t;
  }, [brickColor]);
  const wallBrickNormal = useMemo(() => {
    const t = brickNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(55, 3); t.needsUpdate = true; return t;
  }, [brickNormal]);
  const wallBrickRough = useMemo(() => {
    const t = brickRough.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(55, 3); t.needsUpdate = true; return t;
  }, [brickRough]);
  const wallBrickAO = useMemo(() => {
    const t = brickAO.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(55, 3); t.needsUpdate = true; return t;
  }, [brickAO]);

  // Ladrillos para muros de fondo y pilares (Ladrillos más grandes)
  const backBrickColor = useMemo(() => {
    const t = brickColor.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 3); t.needsUpdate = true; return t;
  }, [brickColor]);
  const backBrickNormal = useMemo(() => {
    const t = brickNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 3); t.needsUpdate = true; return t;
  }, [brickNormal]);
  const backBrickRough = useMemo(() => {
    const t = brickRough.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 3); t.needsUpdate = true; return t;
  }, [brickRough]);
  const backBrickAO = useMemo(() => {
    const t = brickAO.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 3); t.needsUpdate = true; return t;
  }, [brickAO]);

  // Ladrillos para la sala contigua del fondo (Ladrillos más grandes)
  const backRoomBrickColor = useMemo(() => {
    const t = brickColor.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 3); t.needsUpdate = true; return t;
  }, [brickColor]);
  const backRoomBrickNormal = useMemo(() => {
    const t = brickNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 3); t.needsUpdate = true; return t;
  }, [brickNormal]);
  const backRoomBrickRough = useMemo(() => {
    const t = brickRough.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 3); t.needsUpdate = true; return t;
  }, [brickRough]);
  const backRoomBrickAO = useMemo(() => {
    const t = brickAO.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 3); t.needsUpdate = true; return t;
  }, [brickAO]);

  // Cemento para el panel central del techo (Placas brutas gigantes de 17.5m de largo x 5.75m de ancho)
  const ceilingConcreteColor = useMemo(() => {
    const t = concreteColor.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 1.2); // 4 repeticiones a lo largo (Z), 1.2 a lo ancho (X) para bloques colosales brutalistas
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteColor]);
  const ceilingConcreteNormal = useMemo(() => {
    const t = concreteNormal.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 1.2);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteNormal]);
  const ceilingConcreteRough = useMemo(() => {
    const t = concreteRough.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 1.2);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteRough]);
  const ceilingConcreteAO = useMemo(() => {
    const t = concreteAO.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 1.2);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteAO]);

  // Cemento específico para los laterales bajos (Placas de 17.5m de largo x 5m de ancho)
  const sideConcreteColor = useMemo(() => {
    const t = concreteColor.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 0.5); // Proporción perfectamente alineada en escala con el centro
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteColor]);
  const sideConcreteNormal = useMemo(() => {
    const t = concreteNormal.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 0.5);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteNormal]);
  const sideConcreteRough = useMemo(() => {
    const t = concreteRough.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 0.5);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteRough]);
  const sideConcreteAO = useMemo(() => {
    const t = concreteAO.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 0.5);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteAO]);

  // Vigas de concreto longitudinales - bloques alineados longitudinalmente
  const beamConcreteColor = useMemo(() => {
    const t = concreteColor.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.08, 4);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteColor]);
  const beamConcreteNormal = useMemo(() => {
    const t = concreteNormal.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.08, 4);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteNormal]);
  const beamConcreteRough = useMemo(() => {
    const t = concreteRough.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.08, 4);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteRough]);
  const beamConcreteAO = useMemo(() => {
    const t = concreteAO.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.08, 4);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [concreteAO]);

  // Cloned Wood Parquet Textures for Independent UV Coordinates
  const woodColorTex = useMemo(() => {
    const t = woodColor.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(56, 12); // Proporción 4.67 (56/12) que coincide con las dimensiones físicas del piso (70m / 15m) para evitar estiramientos
    t.rotation = Math.PI / 2; // Orientada longitudinalmente
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [woodColor]);

  const woodNormalTex = useMemo(() => {
    const t = woodNormal.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(56, 12);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [woodNormal]);

  const woodRoughTex = useMemo(() => {
    const t = woodRough.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(56, 12);
    t.rotation = Math.PI / 2;
    t.center.set(0.5, 0.5);
    t.needsUpdate = true;
    return t;
  }, [woodRough]);

  const ceilingMaterialProps = {
    normalMap: ceilingConcreteNormal,
    normalScale: new THREE.Vector2(0.42, 0.42), // Relieve tridimensional nítido de las juntas de placas gigantes brutalistas
    color: "#9c9c9c", // Gris sólido limpio y elegante de cemento real
    roughness: 1.0, // 100% mate absoluto, elimina cualquier reflejo especular o brillo de bombillas
    metalness: 0.0,
    side: THREE.DoubleSide
  };

  const sideCeilingMaterialProps = {
    normalMap: sideConcreteNormal,
    normalScale: new THREE.Vector2(0.42, 0.42), // Sincronizado
    color: "#9c9c9c",
    roughness: 1.0, // 100% mate absoluto
    metalness: 0.0,
    side: THREE.DoubleSide
  };

  const stepMaterialProps = {
    normalMap: beamConcreteNormal,
    normalScale: new THREE.Vector2(0.42, 0.42), // Sincronizado
    color: "#9c9c9c",
    roughness: 1.0, // 100% mate absoluto
    metalness: 0.0,
    side: THREE.DoubleSide
  };

  const sideWallMaterialProps = {
    normalMap: wallBrickNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    color: "#242424", // Grafito oscuro profundo elegante
    specular: "#000000ff", // Cero brillo especular
    shininess: 30 // Mate total
  };

  const backWallConcreteProps = {
    normalMap: backBrickNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    color: "#242424", // Grafito oscuro unificado
    specular: "#000000", // Cero brillo especular
    shininess: 30 // Mate total
  };

  const edgeBrickNormal = useMemo(() => {
    const t = brickNormal.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.234, 3); // Ajuste proporcional de ladrillos para el espesor de 30cm (0.3m / 1.28m)
    t.needsUpdate = true;
    return t;
  }, [brickNormal]);

  const edgeWallMaterialProps = {
    normalMap: edgeBrickNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    color: "#242424",
    specular: "#000000",
    shininess: 30
  };

  const backRoomProps = {
    normalMap: backRoomBrickColor, // Usando como relieve para la sala trasera
    color: "#242424", // Grafito oscuro unificado
    roughness: 1.0, // 100% mate total
    metalness: 0.0
  };

  return (
    <group>
      {/* PISO PRINCIPAL EXTENDIDO HASTA Z = -62.5 (Profundidad total de 70m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -27.5]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, 70]} />
        <meshStandardMaterial
          map={woodColorTex}
          normalMap={woodNormalTex}
          normalScale={new THREE.Vector2(0.35, 0.35)} // Relieve fino y definido para marcar los tablones
          color="#604b3f" // Madera nogal café oscuro cálido, se distingue de forma espectacular sin reflejos
          roughness={1.0} // ¡100% mate absoluto! Elimina por completo cualquier brillo o aspecto de pista de patinaje
          metalness={0.0} // Dieléctrico madera, cero especularidad
        />
      </mesh>

      {/* SISTEMA DE CIELORRASO FLOTANTE SUSPENDIDO CON COVES DE LUZ LED INDIRECTA (FOSA ABIERTA HASTA X = ±3.2) */}
      {/* 1. Techo Central (Receso Alto, Ensanchado a 6.4m para cobijar la fosa, Y = ROOM_HEIGHT = 5.0) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, -27.5]} receiveShadow>
        <planeGeometry args={[6.4, 70]} />
        <meshStandardMaterial {...ceilingMaterialProps} />
      </mesh>

      {/* 2. Cielorraso Lateral Izquierdo Flotante (Termina exactamente a 90 grados en X = -3.2, Y = 4.60) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-4.475, ROOM_HEIGHT - 0.4, -27.5]} receiveShadow>
        <planeGeometry args={[2.55, 70]} />
        <meshStandardMaterial {...sideCeilingMaterialProps} />
      </mesh>

      {/* 3. Cielorraso Lateral Derecho Flotante (Termina exactamente a 90 grados en X = 3.2, Y = 4.60) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[4.475, ROOM_HEIGHT - 0.4, -27.5]} receiveShadow>
        <planeGeometry args={[2.55, 70]} />
        <meshStandardMaterial {...sideCeilingMaterialProps} />
      </mesh>

      {/* 4. Escalón Vertical Izquierdo (Altura de 40cm a X = -3.2 para la fosa súper profunda) */}
      <mesh position={[-3.2, ROOM_HEIGHT - 0.2, -27.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <planeGeometry args={[70, 0.4]} />
        <meshStandardMaterial {...stepMaterialProps} />
      </mesh>

      {/* 5. Escalón Vertical Derecho (Altura de 40cm a X = 3.2 para la fosa súper profunda) */}
      <mesh position={[3.2, ROOM_HEIGHT - 0.2, -27.5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
        <planeGeometry args={[70, 0.4]} />
        <meshStandardMaterial {...stepMaterialProps} />
      </mesh>

      {/* 6. Tiras LED físicas completamente removidas de la escena 3D: garantiza que jamás se vea un tubo o línea brillante, viéndose únicamente su reflejo de luz indirecta */}

      {/* 7. Secuencia de Luces Cove Indirectas (Optimizada a 6 focos por lado para evitar colapso de WebGL) */}
      {Array.from({ length: 6 }).map((_, i) => {
        const zPos = -60.0 + i * 10.0; // Distribución óptima espaciada
        return (
          <group key={`cove-light-seq-${i}`}>
            {/* Baño Izquierdo */}
            <pointLight
              position={[-3.18, ROOM_HEIGHT - 0.05, zPos]}
              intensity={0.6}
              distance={16.0}
              decay={0.5}
              color="#ffffff"
            />
            {/* Baño Derecho */}
            <pointLight
              position={[3.18, ROOM_HEIGHT - 0.05, zPos]}
              intensity={0.6}
              distance={16.0}
              decay={0.5}
              color="#ffffff"
            />
          </group>
        );
      })}

      {/* PAREDES PRINCIPALES EXTENDIDAS HASTA Z = -62.5 (Profundidad total de 70m) */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -27.5]} receiveShadow>
        <planeGeometry args={[70, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -27.5]} receiveShadow>
        <planeGeometry args={[70, ROOM_HEIGHT]} />
        <meshPhongMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* TABIQUE DIVISOR CENTRAL PREMIUM - AHORA FORMADO POR PLANOS CON TEXTURA DE LADRILLO ALINEADA SIN ESTIRAR */}
      {/* Frente del tabique */}
      <mesh position={[0, ROOM_HEIGHT / 2, -21.0]} receiveShadow castShadow>
        <planeGeometry args={[6.4, ROOM_HEIGHT]} />
        <meshPhongMaterial {...backWallConcreteProps} />
      </mesh>
      {/* Borde Lateral Izquierdo del tabique con textura de ladrillo proporcional */}
      <mesh position={[-3.2, ROOM_HEIGHT / 2, -21.15]} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
        <planeGeometry args={[0.3, ROOM_HEIGHT]} />
        <meshPhongMaterial {...edgeWallMaterialProps} />
      </mesh>
      {/* Borde Lateral Derecho del tabique con textura de ladrillo proporcional */}
      <mesh position={[3.2, ROOM_HEIGHT / 2, -21.15]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <planeGeometry args={[0.3, ROOM_HEIGHT]} />
        <meshPhongMaterial {...edgeWallMaterialProps} />
      </mesh>

      {/* PARED DE ENTRADA / DETRÁS DE LA VISTA GENERAL (Z = 4.0) */}
      <mesh position={[0, ROOM_HEIGHT / 2, 4.0]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshPhongMaterial {...backWallConcreteProps} />
      </mesh>

      {/* PILARES ARQUITECTÓNICOS DE CONCRETO PARA APORTAR RIQUEZA 3D, SOMBRAS Y DETALLE */}
      <mesh position={[-3.8, ROOM_HEIGHT / 2, 3.8]} receiveShadow castShadow>
        <boxGeometry args={[0.8, ROOM_HEIGHT, 0.4]} />
        <meshPhongMaterial {...backWallConcreteProps} />
      </mesh>
      <mesh position={[3.8, ROOM_HEIGHT / 2, 3.8]} receiveShadow castShadow>
        <boxGeometry args={[0.8, ROOM_HEIGHT, 0.4]} />
        <meshPhongMaterial {...backWallConcreteProps} />
      </mesh>

      {/* PANEL DE MÁRMOL NEGRO PULIDO DE FONDO PARA EL CUADRO */}
      <mesh position={[0, 2.3, 3.98]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 3.8, 0.05]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.15} metalness={0.8} />
      </mesh>

      {/* CUADRO DE ALFREDO DI STÉFANO CON RELACIÓN DE ASPECTO 1.5 CORRECTA (1200x800) */}
      <group>
        {/* Marco 3D de madera oscura/negra */}
        <mesh position={[0, 2.3, 3.95]} castShadow receiveShadow>
          <boxGeometry args={[5.0, 3.4, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.75} metalness={0.1} />
        </mesh>

        {/* Borde interior dorado premium */}
        <mesh position={[0, 2.3, 3.89]} castShadow>
          <boxGeometry args={[4.88, 3.28, 0.04]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Lienzo/Foto original sin deformación (Z-fighting resuelto con separación física) */}
        <mesh position={[0, 2.3, 3.85]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
          <planeGeometry args={[4.8, 3.2]} />
          <meshStandardMaterial map={distefanoTex} roughness={0.5} metalness={0.05} />
        </mesh>
      </group>

      {/* TEXTO DORADO ELEGANTE */}
      <Text
        position={[0, 4.4, 3.92]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.32}
        material={PORTRAIT_TEXT_MATERIAL}
        anchorX="center"
        anchorY="middle"
      >
        LA SAETA RUBIA
      </Text>

      {/* LUMINARIA DICROICA FÍSICA PARA EL RETRATO (NEGRO MATE CORTO Y ELEGANTE) */}
      <group position={[0, 6.2, 1.8]} rotation={[-0.45, 0, 0]}>
        <mesh castShadow={false} position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.142, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* TARGET LOCAL PARA EL FOCO DEL CUADRO */}
      <object3D ref={setPortraitTarget} position={[0, 2.3, 3.85]} />

      {/* LUZ DE DICROICA ESTÁTICA Y TENUE DIRIGIDA AL CUADRO (EVITA CUALQUIER AS EN EL TECHO Y PISO) */}
      <spotLight
        position={[0, 5.75, 1.8]} // Bajado ligeramente para evitar colisión con el techo
        target={portraitTarget}
        angle={0.45} // Haz más estrecho y preciso
        penumbra={0.2} // Penumbra baja para evitar dispersión hacia atrás
        intensity={6.0}
        color="#ffffff" // Luz blanca pura neutra sin tintes
        decay={1.2}
        distance={10}
        castShadow={true}
      />

      {/* PUERTA/PASILLO DE ENTRADA EN LA PARED LATERAL IZQUIERDA (X = -7.5, Z = 2.2) */}
      <group>
        {/* Fondo negro de la puerta (rehundido en la pared para dar efecto de profundidad) */}
        <mesh position={[-7.52, 1.8, 2.2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.2, 3.6]} />
          <meshBasicMaterial color="#010101" />
        </mesh>
        {/* Marco elegante de metal oscuro que sobresale de la pared */}
        <mesh position={[-7.48, 1.8, 2.2]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[2.3, 3.7, 0.06]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* Tapa interior del marco para mantener el vacío negro */}
        <mesh position={[-7.51, 1.8, 2.2]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[2.2, 3.6, 0.08]} />
          <meshBasicMaterial color="#010101" />
        </mesh>
      </group>
    </group>
  );
};

const Handrail = ({ x }) => {
  return (
    <group>
      {/* Poste inferior (en el piso Y=0) */}
      <mesh position={[x, 0.45, -2.4]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 16]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Poste superior (en el descanso Y=1.2) */}
      <mesh position={[x, 1.65, -3.2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 16]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Pasamanos inclinado */}
      <mesh position={[x, 1.5, -2.8]} rotation={[-0.588, 0, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.44, 16]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Extensión horizontal del pasamanos hasta la pared de fondo (Z = -5.4 local) */}
      <mesh position={[x, 2.1, -4.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 2.2, 16]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
};

const PremiumPlatform = () => {
  const concreteTexOrig = useTexture('/Road013A_4K-JPG_Color.jpg');
  const concreteTex = useMemo(() => {
    const t = concreteTexOrig.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 2);
    t.needsUpdate = true;
    return t;
  }, [concreteTexOrig]);

  return (
    <group position={[0, 0, -15.6]}>
      {/* PLATAFORMA PREMIUM MÁS CORTA (Huellas de 40cm en vez de 1.0m) */}
      <mesh position={[0, 0.2, -3.9]} receiveShadow castShadow>
        <boxGeometry args={[6.4, 0.4, 3.0]} />
        <meshStandardMaterial map={concreteTex} color="#bbbbbb" roughness={0.95} metalness={0.0} />
      </mesh>
      <mesh position={[0, 0.6, -4.1]} receiveShadow castShadow>
        <boxGeometry args={[6.4, 0.4, 2.6]} />
        <meshStandardMaterial map={concreteTex} color="#bbbbbb" roughness={0.95} metalness={0.0} />
      </mesh>
      <mesh position={[0, 1.0, -4.3]} receiveShadow castShadow>
        <boxGeometry args={[6.4, 0.4, 2.2]} />
        <meshStandardMaterial map={concreteTex} color="#bbbbbb" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* BARANDAS LATERALES DE BRONCE/ORO pulido */}
      <Handrail x={-3.22} />
      <Handrail x={3.22} />
    </group>
  );
};

const JerseyModel = ({ active, initialRotY = 0 }) => {
  const { scene } = useGLTF('/camiseta.glb');
  const group = useRef();
  const clonedScene = useMemo(() => {
    const s = scene.clone();
    s.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return s;
  }, [scene]);

  useEffect(() => {
    if (group.current) {
      group.current.rotation.y = initialRotY;
    }
  }, [initialRotY]);

  useFrame((state, delta) => {
    if (group.current) {
      if (active) {
        group.current.rotation.y += delta * 0.45;
      } else {
        group.current.rotation.y = initialRotY;
      }
    }
  });

  return (
    <Float speed={active ? 1.8 : 0} rotationIntensity={active ? 0.2 : 0} floatIntensity={0}>
      <group position={[0, 2.35, 0]} ref={group}>
        <Center><primitive object={clonedScene} scale={1.3} /></Center>
      </group>
    </Float>
  );
};

// --- RÉPLICA 3D MAJESTUOSA DEL TROFEO BALÓN DE ORO ---
const GoldenTrophyModel = ({ active }) => {
  const group = useRef();

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.55;
    }
  });

  return (
    <Float speed={active ? 2.2 : 0} rotationIntensity={active ? 0.35 : 0} floatIntensity={0.08}>
      <group position={[0, 2.1, 0]} ref={group}>
        {/* Base circular dorada */}
        <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.1, 32]} />
          <meshStandardMaterial color="#b89a42" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Pedestal de mármol negro */}
        <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Plato receptor de oro */}
        <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.24, 0.15, 0.08, 32]} />
          <meshStandardMaterial color="#b89a42" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* El Balón de Oro */}
        <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.28, 64, 64]} />
          <meshStandardMaterial
            color="#ffe17d"
            metalness={0.98}
            roughness={0.06}
          />
        </mesh>

        {/* Punto de luz de gloria dorado que ilumina el trofeo */}
        <pointLight position={[0, 0.72, 0]} color="#fff0b3" intensity={2.5} distance={5} decay={2} />
      </group>
    </Float>
  );
};

// --- CAMISETA CUBIERTA DE TERCIOPELO AZUL REAL ---
const CoveredJerseyModel = ({ initialRotY = 0 }) => {
  const [fabricColorOrig, fabricNormalOrig, fabricRoughOrig] = useTexture([
    '/Fabric022_4K-JPG_Color.jpg',
    '/Fabric022_4K-JPG_NormalGL.jpg',
    '/Fabric022_4K-JPG_Roughness.jpg'
  ]);

  const [fabricColor, fabricNormal, fabricRough] = useMemo(() => {
    const c = fabricColorOrig.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(24, 24); c.needsUpdate = true;
    const n = fabricNormalOrig.clone(); n.wrapS = n.wrapT = THREE.RepeatWrapping; n.repeat.set(24, 24); n.needsUpdate = true;
    const r = fabricRoughOrig.clone(); r.wrapS = r.wrapT = THREE.RepeatWrapping; r.repeat.set(24, 24); r.needsUpdate = true;
    return [c, n, r];
  }, [fabricColorOrig, fabricNormalOrig, fabricRoughOrig]);

  const velvetMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: fabricColor,
      normalMap: fabricNormal,
      normalScale: new THREE.Vector2(0.35, 0.35), // Relieve fino para microfibra de terciopelo
      roughnessMap: fabricRough,
      color: "#0c2359", // Azul real premium vibrante y profundo
      roughness: 0.96,
      metalness: 0.0,
      sheen: 1.0,
      sheenColor: new THREE.Color("#4a80ff"), // Brillo aterciopelado en contornos
      sheenRoughness: 0.5
    });
  }, [fabricColor, fabricNormal, fabricRough]);

  // Cilindro procedural que se moldea a la silueta de un torso (hombros, pecho, cintura y caída)
  const cylinderGeom = useMemo(() => {
    const g = new THREE.CylinderGeometry(1.0, 1.0, 1.35, 64, 64, true);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      const theta = Math.atan2(z, x);
      const pctY = (0.675 - y) / 1.35; // 0 arriba, 1 abajo

      // Interpolación del perfil del torso humano
      let rx, rz;
      if (y > 0.4) {
        // De los hombros hacia el cuello
        const t = (y - 0.4) / 0.275;
        rx = THREE.MathUtils.lerp(0.46, 0.18, t);
        rz = THREE.MathUtils.lerp(0.24, 0.18, t);
      } else if (y > -0.2) {
        // Torso, pecho y estrechamiento de cintura
        const t = (y + 0.2) / 0.6;
        rx = THREE.MathUtils.lerp(0.34, 0.46, t);
        rz = THREE.MathUtils.lerp(0.22, 0.24, t);
      } else {
        // Caída desde la cadera que se ensancha tapando el atril
        const t = (y + 0.675) / 0.475;
        rx = THREE.MathUtils.lerp(0.68, 0.34, t);
        rz = THREE.MathUtils.lerp(0.68, 0.22, t);
      }

      // Pliegues verticales realistas
      const foldFrequency = 10.0;
      const foldWave = Math.sin(theta * foldFrequency);
      const foldAmplitude = 0.08 * Math.pow(pctY, 1.1) * (1.0 + 0.3 * Math.sin(y * 8.0));

      // Aplicación de elipse del torso + pliegues
      const newX = Math.cos(theta) * (rx + foldWave * foldAmplitude);
      const newZ = Math.sin(theta) * (rz + foldWave * foldAmplitude);

      pos.setX(i, newX);
      pos.setZ(i, newZ);

      // Dobladillo inferior orgánico
      if (pctY > 0.92) {
        const hemWiggle = Math.sin(theta * 14.0) * 0.04 * ((pctY - 0.92) / 0.08);
        pos.setY(i, y + hemWiggle);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);

  // Cúpula superior adaptada orgánicamente al cuello
  const domeGeom = useMemo(() => {
    const g = new THREE.SphereGeometry(0.18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const theta = Math.atan2(z, x);
      const fold = Math.sin(theta * 10.0) * 0.015 * (y / 0.18);
      const r = Math.sqrt(x * x + z * z) + fold;
      pos.setX(i, Math.cos(theta) * r);
      pos.setZ(i, Math.sin(theta) * r);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group position={[0, 2.35, 0]}>
      {/* Cúpula superior */}
      <mesh geometry={domeGeom} material={velvetMaterial} position={[0, 0.675, 0]} castShadow receiveShadow />
      {/* Caída de tela amoldada al torso */}
      <mesh geometry={cylinderGeom} material={velvetMaterial} position={[0, 0, 0]} castShadow receiveShadow />
    </group>
  );
};

const FloatingHoloLock = () => {
  const group = useRef();

  useFrame((state) => {
    if (group.current) {
      // Rotación suave del candado
      group.current.rotation.y = state.clock.getElapsedTime() * 0.8;
      // Flotación arriba/abajo
      group.current.position.y = 2.45 + Math.sin(state.clock.getElapsedTime() * 2.0) * 0.05;
    }
  });

  return (
    <group ref={group} position={[0, 2.45, 0]}>
      {/* Cuerpo del candado */}
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.18, 0.08]} />
        <meshStandardMaterial
          color="#ffa800"
          emissive="#ff6a00"
          emissiveIntensity={1.8}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Arco (shackle) del candado */}
      <mesh position={[0, 0.09, 0]} castShadow>
        <torusGeometry args={[0.07, 0.016, 8, 24, Math.PI]} />
        <meshStandardMaterial
          color="#ffa800"
          emissive="#ff6a00"
          emissiveIntensity={1.8}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Detalle ojo de la cerradura (Keyhole) */}
      <mesh position={[0, -0.02, 0.041]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.002, 16]} />
        <meshBasicMaterial color="#221100" />
      </mesh>
      <mesh position={[0, -0.045, 0.041]}>
        <boxGeometry args={[0.012, 0.03, 0.002]} />
        <meshBasicMaterial color="#221100" />
      </mesh>

      {/* Luz puntual de brillo interno */}
      <pointLight color="#ffa800" intensity={2.0} distance={2.0} decay={2.0} />
    </group>
  );
};

const PedestalStation = ({ exhibit, isActive, isPremiumEnabled }) => {
  const concreteTexOrig = useTexture('/Road013A_4K-JPG_Color.jpg');
  const metalTexOrig = useTexture('/Metal048C_4K-JPG_Color.jpg');

  const concreteTex = useMemo(() => {
    const t = concreteTexOrig.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, [concreteTexOrig]);

  const metalTex = useMemo(() => {
    const t = metalTexOrig.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, [metalTexOrig]);

  const actualCeilingHeight = exhibit.type === 'premium' ? ROOM_HEIGHT : (ROOM_HEIGHT - 0.4);
  const lightOffsetX = exhibit.isCenter ? 0 : (exhibit.isLeft ? 1.5 : -1.5);
  const ceilingLightPos = exhibit.type === 'premium'
    ? [exhibit.pos[0], actualCeilingHeight, exhibit.pos[2] + 2.4]
    : [exhibit.pos[0] + lightOffsetX, actualCeilingHeight, exhibit.pos[2]];

  const targetX = exhibit.isCenter ? exhibit.pos[0] : (exhibit.isLeft ? -6.2 : 6.2);
  const targetY = exhibit.type === 'premium' ? 1.6 : 0.5;

  const spotAngle = exhibit.type === 'premium' ? 0.45 : 0.4;

  const lightRef = useRef();
  const [localTarget, setLocalTarget] = useState(null);

  // NUEVO REF Y TARGET PARA LA DICROICA QUE ILUMINA LAS LETRAS DE LA PARED
  const textSpotRef = useRef();
  const [textTarget, setTextTarget] = useState(null);

  // REF PARA EL BAÑADOR DE PARED DORADO (WALL WASHER)
  const upLightRef = useRef();

  useFrame(() => {
    if (lightRef.current) {
      if (exhibit.type === 'premium' && !isPremiumEnabled) {
        lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 70, 0.15);
      } else {
        // Si la exhibición está seleccionada activamente, foco principal destacado.
        // Si estamos en vista general o en otra, un foco ambiente tenue pero distinguible sobre la camiseta.
        const targetIntensity = isActive ? (exhibit.type === 'premium' ? 140 : 100) : 25;
        lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetIntensity, 0.15);
      }
    }

    // Encendido suave de la dicroica del texto de pared al activarse el atril
    if (textSpotRef.current) {
      const targetTextIntensity = isActive ? 80.0 : 0.0;
      textSpotRef.current.intensity = THREE.MathUtils.lerp(textSpotRef.current.intensity, targetTextIntensity, 0.15);
    }

    // Encendido suave del bañador de pared dorado con intensidades aumentadas para visibilidad real
    if (upLightRef.current) {
      const targetUpIntensity = isActive ? (isPremiumEnabled ? 300.0 : 200.0) : 120.0;
      upLightRef.current.intensity = THREE.MathUtils.lerp(upLightRef.current.intensity, targetUpIntensity, 0.1);
    }
  });

  // Asegura la correcta vinculación del target del spotlight hacia arriba/atrás
  useEffect(() => {
    if (upLightRef.current) {
      const targetObj = upLightRef.current.target;
      if (targetObj.position.y !== 5) {
        targetObj.position.set(0, 5, -0.15); // Apunta hacia arriba y ligeramente hacia la pared
        upLightRef.current.add(targetObj);
      }
    }
  });

  return (
    <group>
      {/* ATRIL */}
      <mesh position={[exhibit.pos[0], exhibit.pos[1] + 0.05, exhibit.pos[2]]} castShadow receiveShadow>
        <boxGeometry args={[1.25, 0.08, 1.25]} />
        <meshStandardMaterial map={metalTex} color="#a6842e" metalness={0.0} roughness={1.0} />
      </mesh>

      <mesh position={[exhibit.pos[0], exhibit.pos[1] + 0.9, exhibit.pos[2]]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.6, 1.2]} />
        <meshStandardMaterial map={concreteTex} color="#b0b0b0" metalness={0.0} roughness={1.0} />
      </mesh>

      <mesh position={[exhibit.pos[0], exhibit.pos[1] + 1.75, exhibit.pos[2]]} castShadow receiveShadow>
        <boxGeometry args={[1.25, 0.08, 1.25]} />
        <meshStandardMaterial map={metalTex} color="#a6842e" metalness={0.0} roughness={1.0} />
      </mesh>

      <group position={exhibit.pos}>
        {exhibit.type === 'regular' ? (
          <JerseyModel active={isActive} initialRotY={exhibit.initialRotY} />
        ) : (
          // Sección Premium: Vitrina de vidrio siempre visible
          <group>
            {/* Vitrina de vidrio premium con marco dorado */}
            <group position={[0, 2.39, 0]}>
              {/* Vidrio transparente con refracción y brillo */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.9, 1.2, 0.9]} />
                <meshStandardMaterial
                  color="#ffffff"
                  transparent={true}
                  opacity={0.15}
                  roughness={0.05}
                  metalness={0.9}
                />
              </mesh>
              {/* Parantes de las esquinas en oro */}
              <mesh position={[0.44, 0, 0.44]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 1.2, 8]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
              </mesh>
              <mesh position={[-0.44, 0, 0.44]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 1.2, 8]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
              </mesh>
              <mesh position={[0.44, 0, -0.44]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 1.2, 8]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
              </mesh>
              <mesh position={[-0.44, 0, -0.44]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 1.2, 8]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
              </mesh>
              {/* Base y tapa de la vitrina */}
              <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.92, 0.02, 0.92]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
              </mesh>
              <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.92, 0.02, 0.92]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
              </mesh>
            </group>

            {isPremiumEnabled ? (
              /* El Balón de Oro majestuoso */
              <GoldenTrophyModel active={isActive} />
            ) : (
              /* Holograma de candado dorado brillante flotando y girando */
              <FloatingHoloLock />
            )}
          </group>
        )}
      </group>

      {/* RENDERIZADO EXCLUSIVO DE TEXTOS PARA EXHIBICIONES REGULARES */}
      {exhibit.type === 'regular' && (
        <group position={exhibit.textPos} rotation={[0, exhibit.rotY, 0]}>
          <Text
            fontSize={0.20}
            material={GOLD_TEXT_MATERIAL}
            position={[0, 0, 0]}
            anchorX="center"
          >
            {exhibit.title}
          </Text>
          <Text
            fontSize={0.14}
            material={WHITE_TEXT_MATERIAL}
            position={[0, -0.3, 0]}
            anchorX="center"
            letterSpacing={0.05}
          >
            {exhibit.year}
          </Text>
          <Text
            fontSize={0.075}
            material={WHITE_TEXT_MATERIAL}
            position={[0, -0.65, 0]}
            anchorX="center"
            maxWidth={2.4}
            textAlign="center"
            lineHeight={1.5}
          >
            {exhibit.desc}
          </Text>
        </group>
      )}

      {/* DICROICA EXCLUSIVA PARA EL TEXTO DE PARED (Se activa dinámicamente) */}
      {exhibit.type === 'regular' && (
        <group
          position={[exhibit.isLeft ? -4.3 : 4.3, actualCeilingHeight, exhibit.textPos[2]]}
          rotation={[0, 0, exhibit.isLeft ? -0.6 : 0.6]}
        >
          {/* FÍSICA DE LA DICROICA */}
          <mesh castShadow={false} position={[0, -0.075, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
            <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.142, 0]}>
            <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
            <meshBasicMaterial color={isActive ? "#ffffff" : "#222222"} />
          </mesh>

          {/* TARGET DE LUZ APUNTANDO AL TEXTO EN LA PARED */}
          <object3D ref={setTextTarget} position={[0, -5, 0]} />

          {/* LUZ CON FOCO SUAVE AL TEXTO (Renderizada solo cuando está activa para optimizar WebGL) */}
          {isActive && (
            <spotLight
              ref={textSpotRef}
              position={[0, -0.15, 0]}
              target={textTarget}
              angle={0.45}
              penumbra={0.8}
              intensity={0}
              color="#ffffff"
              decay={1.1}
              distance={8}
              castShadow={false}
            />
          )}
        </group>
      )}

      {/* BAÑADOR DE PARED DORADO DETRÁS DEL ATRIL PREMIUM */}
      {exhibit.type === 'premium' && (
        <group position={[exhibit.pos[0], 0.05, -20.92]}>
          <spotLight
            ref={upLightRef}
            angle={0.8}
            penumbra={0.6}
            intensity={0}
            color="#ffa822" // Cálido dorado premium
            decay={1.2}
            distance={12} // Distancia aumentada para subir desde el piso
            castShadow={false}
          />
        </group>
      )}

      {/* GRUPO CON ROTACIÓN Y PIVOTE DEL CIELORRASO UNIFICADOS */}
      {(() => {
        const tiltX = exhibit.type === 'premium' ? 0.50 : (exhibit.isCenter ? 0.25 : 0);
        const tiltZ = exhibit.isCenter ? 0 : (exhibit.isLeft ? -0.3 : 0.3);
        return (
          <group position={ceilingLightPos} rotation={[tiltX, 0, tiltZ]}>
            {/* LÁMPARA DICROICA FISICA NEGRO MATE */}
            <CeilingFixture active={isActive} />

            {/* HAZ DE LUZ VOLUMÉTRICO PERFECTAMENTE ALINEADO */}
            <VolumetricLightBeam active={isActive} ceilingHeight={actualCeilingHeight} />

            {/* OBJETO TARGET LOCAL: Alinea la luz exactamente sobre el eje del cilindro inclinado */}
            <object3D ref={setLocalTarget} position={[0, -10, 0]} />

            {/* LUZ DE FOCO DIRECCIONAL QUE PARTE DEL LENTE Y SIGUE LA ROTACIÓN LOCAL */}
            <spotLight
              ref={lightRef}
              position={[0, -0.28, 0]} // Posición bajada para alejar el foco del plano del techo
              target={localTarget}
              angle={spotAngle * 0.82} // Haz ligeramente más concentrado y controlado
              penumbra={0.22} // Penumbra muy acotada que impide la dispersión de luz hacia atrás
              intensity={0}
              color="#ffffff" // Luz blanca pura, cero tintes cálidos
              decay={1.5}
              distance={25}
              castShadow={true}
              shadow-mapSize={[1024, 1024]}
              shadow-bias={-0.0005}
            />
          </group>
        );
      })()}
    </group>
  );
};

const CameraRig = ({ activeIndex }) => {
  const { camera } = useThree();
  const controls = useRef();

  useEffect(() => {
    if (activeIndex === null) {
      // VISTA GENERAL - PERSPECTIVA ELEVADA Y MÁS CENITAL DE ALTÍSIMO IMPACTO ARQUITECTÓNICO
      gsap.to(camera.position, {
        x: 0,
        y: 2.8, // Elevado de 2.2 a 2.8 para vista cenital (más alta y majestuosa)
        z: -1.5, // Traído cerca en el eje Z para mayor proximidad
        duration: 3.0,
        ease: 'power3.inOut',
        onUpdate: () => { if (controls.current) controls.current.update(); }
      });

      if (controls.current) {
        gsap.to(controls.current.target, {
          x: 0,
          y: 1.3, // Bajado de 1.8 a 1.3 para inclinar el eje de la cámara levemente hacia abajo
          z: -12.5,
          duration: 3.0,
          ease: 'power3.inOut'
        });
      }
    } else if (activeIndex === 'premium_general') {
      // VISTA GENERAL PREMIUM: TRAÍDO AÚN MÁS CERCA EN Z = -14.5 PARA IMPACTO ABSOLUTO
      gsap.to(camera.position, {
        x: 0,
        y: 3.5,
        z: -14.5,
        duration: 3.0,
        ease: 'power3.inOut',
        onUpdate: () => { if (controls.current) controls.current.update(); }
      });

      if (controls.current) {
        gsap.to(controls.current.target, {
          x: 0,
          y: 2.6,
          z: -20.4,
          duration: 3.0,
          ease: 'power3.inOut'
        });
      }
    } else {
      const targetExhibit = EXHIBITS[activeIndex];

      gsap.to(camera.position, {
        x: targetExhibit.camPos[0],
        y: targetExhibit.camPos[1],
        z: targetExhibit.camPos[2],
        duration: 2.5,
        ease: 'power3.inOut',
        onUpdate: () => { if (controls.current) controls.current.update(); }
      });

      if (controls.current) {
        gsap.to(controls.current.target, {
          x: targetExhibit.pos[0],
          y: targetExhibit.isCenter ? 2.2 : 2.35,
          z: targetExhibit.pos[2],
          duration: 2.5,
          ease: 'power3.inOut'
        });
      }
    }
  }, [activeIndex, camera]);

  useFrame(() => {
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -6.7, 6.7);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 1.3, ROOM_HEIGHT - 0.4); // Evita que la cámara caiga debajo de la escalinata o pase el cielorraso
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -19.5, 2.8); // Clamp ajustado para no traspasar la pared de entrada a Z = 4.0

    if (controls.current) {
      controls.current.target.x = THREE.MathUtils.clamp(controls.current.target.x, -7.0, 7.0);
      controls.current.target.y = THREE.MathUtils.clamp(controls.current.target.y, 1.0, ROOM_HEIGHT - 0.2); // Evita que el target caiga demasiado bajo o suba de más
      controls.current.target.z = THREE.MathUtils.clamp(controls.current.target.z, -24.0, 3.2); // Target clamp a Z = 3.2
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2.05} // Bloquea la inclinación para no ver por debajo de la escalinata o el horizonte
      minDistance={1.8}
      maxDistance={25}
      makeDefault
    />
  );
};

const TextLighting = () => {
  const groupRef = useRef();
  const spot1 = useRef();
  const spot2 = useRef();

  useEffect(() => {
    if (groupRef.current && spot1.current && spot2.current) {
      const g = groupRef.current;

      spot1.current.target.position.set(-0.8, 5.4, -20.95);
      g.add(spot1.current.target);

      spot2.current.target.position.set(0.8, 5.4, -20.95);
      g.add(spot2.current.target);
    }
  }, []);

  return (
    <group ref={groupRef}>
      <group position={[-1.8, ROOM_HEIGHT, -17.2]} rotation={[0.3, -0.25, 0]}>
        <mesh castShadow={false} position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.142, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      <group position={[1.8, ROOM_HEIGHT, -17.2]} rotation={[0.3, 0.25, 0]}>
        <mesh castShadow={false} position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.142, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      <spotLight
        ref={spot1}
        position={[-1.8, ROOM_HEIGHT - 0.2, -17.2]}
        angle={0.38}
        penumbra={0.6}
        intensity={35.0}
        color="#ffffff"
        decay={1.2}
        distance={8}
        castShadow={false}
      />
      <spotLight
        ref={spot2}
        position={[1.8, ROOM_HEIGHT - 0.2, -17.2]}
        angle={0.38}
        penumbra={0.6}
        intensity={35.0}
        color="#ffffff"
        decay={1.2}
        distance={8}
        castShadow={false}
      />
    </group>
  );
};

const CorridorLighting = () => {
  const groupRef = useRef();
  const spot1 = useRef();
  const spot2 = useRef();
  const spot3 = useRef();

  useEffect(() => {
    if (groupRef.current && spot1.current && spot2.current && spot3.current) {
      const g = groupRef.current;

      spot1.current.target.position.set(0, 0, -9.75);
      g.add(spot1.current.target);

      spot2.current.target.position.set(0, 0, -14.25);
      g.add(spot2.current.target);

      spot3.current.target.position.set(0, 0, -5.25);
      g.add(spot3.current.target);
    }
  }, []);

  return (
    <group ref={groupRef}>
      {/* DICROICA PASILLO CENTRAL 3 (Z = -5.25) */}
      <group position={[0, ROOM_HEIGHT, -5.25]}>
        <mesh castShadow={false} position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.142, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <VolumetricLightBeam active={true} ceilingHeight={ROOM_HEIGHT + 1.8} maxOpacity={0.11} />
      </group>
      <spotLight
        ref={spot3}
        position={[0, ROOM_HEIGHT - 0.2, -5.25]}
        angle={0.5}
        penumbra={0.7}
        intensity={170.0}
        color="#ffffff"
        decay={1.2}
        distance={13}
        castShadow={false}
      />

      {/* DICROICA PASILLO CENTRAL 1 (Z = -9.75) */}
      <group position={[0, ROOM_HEIGHT, -9.75]}>
        <mesh castShadow={false} position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.142, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <VolumetricLightBeam active={true} ceilingHeight={ROOM_HEIGHT + 1.8} maxOpacity={0.11} />
      </group>
      <spotLight
        ref={spot1}
        position={[0, ROOM_HEIGHT - 0.2, -9.75]}
        angle={0.5}
        penumbra={0.7}
        intensity={170.0}
        color="#ffffff"
        decay={1.2}
        distance={13}
        castShadow={false}
      />

      {/* DICROICA PASILLO CENTRAL 2 (Z = -14.25) */}
      <group position={[0, ROOM_HEIGHT, -14.25]}>
        <mesh castShadow={false} position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.142, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <VolumetricLightBeam active={true} ceilingHeight={ROOM_HEIGHT + 1.8} maxOpacity={0.11} />
      </group>
      <spotLight
        ref={spot2}
        position={[0, ROOM_HEIGHT - 0.2, -14.25]}
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

const BidirectionalSconce = ({ position, hasLight = false, intensityScale = 1.0 }) => {
  const groupRef = useRef();
  const spotUp = useRef();
  const spotDown = useRef();

  useEffect(() => {
    if (groupRef.current && spotUp.current && spotDown.current) {
      const g = groupRef.current;

      // Target para arriba
      spotUp.current.target.position.set(0, 5, 0);
      g.add(spotUp.current.target);

      // Target para abajo
      spotDown.current.target.position.set(0, -5, 0);
      g.add(spotDown.current.target);
    }
  }, []);

  return (
    <group position={position} ref={groupRef}>
      {/* CUERPO CILÍNDRICO DE METAL NEGRO */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.32, 16]} />
        <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* MONTAJE A LA PARED */}
      <mesh position={[position[0] < 0 ? -0.04 : 0.04, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshStandardMaterial color="#151515" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* LENTES EMISORAS EXTREMAS */}
      <mesh position={[0, 0.161, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.005, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -0.161, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.005, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* SPOTLIGHTS DE PARED */}
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

      {/* CONOS VOLUMÉTRLES SUTILES PARA AMBIENTE */}
      <group rotation={[Math.PI, 0, 0]} position={[0, 0.16, 0]}>
        <VolumetricLightBeam active={true} ceilingHeight={ROOM_HEIGHT - 0.7} maxOpacity={0.10} />
      </group>
      <group position={[0, -0.16, 0]}>
        <VolumetricLightBeam active={true} ceilingHeight={3.9} maxOpacity={0.10} />
      </group>
    </group>
  );
};

const WallSconces = () => {
  return (
    <group>
      {/* SCONCES PARED IZQUIERDA */}
      <BidirectionalSconce position={[-5.67, 2.1, -5.25]} hasLight={true} />
      <BidirectionalSconce position={[-5.67, 2.1, -9.75]} hasLight={true} />
      <BidirectionalSconce position={[-5.67, 2.1, -14.25]} hasLight={true} />
      <BidirectionalSconce position={[-5.67, 2.1, -18.75]} hasLight={true} />
      <BidirectionalSconce position={[-5.67, 2.1, -23.25]} hasLight={true} intensityScale={2.5} />
      <BidirectionalSconce position={[-5.67, 2.1, -27.75]} hasLight={true} intensityScale={2.5} />

      {/* SCONCES PARED DERECHA */}
      <BidirectionalSconce position={[5.67, 2.1, -5.25]} hasLight={true} />
      <BidirectionalSconce position={[5.67, 2.1, -9.75]} hasLight={true} />
      <BidirectionalSconce position={[5.67, 2.1, -14.25]} hasLight={true} />
      <BidirectionalSconce position={[5.67, 2.1, -18.75]} hasLight={true} />
      <BidirectionalSconce position={[5.67, 2.1, -23.25]} hasLight={true} intensityScale={2.5} />
      <BidirectionalSconce position={[5.67, 2.1, -27.75]} hasLight={true} intensityScale={2.5} />
    </group>
  );
};

export default function App() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [started, setStarted] = useState(false);
  const [isPremiumEnabled, setIsPremiumEnabled] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(true); // Estado local para dismiss del modal

  // RESET DEL POPUP CADA VEZ QUE SE ENTRA A LA ZONA PREMIUM
  useEffect(() => {
    if (activeIndex === 'premium_general') {
      setShowPremiumModal(true);
    }
  }, [activeIndex]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', margin: 0, overflow: 'hidden' }}>

      {!started && (
        <div onClick={() => setStarted(true)} style={{ position: 'absolute', width: '100%', height: '100%', background: '#050505', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'serif', color: 'white' }}>
          <h1 style={{ fontSize: '40px', letterSpacing: '8px', fontWeight: '300', color: '#eaeaea' }}>THE VAULT</h1>
          <p style={{ color: '#c8a853', letterSpacing: '4px', marginTop: '10px' }}>INGRESAR AL SANTUARIO</p>
        </div>
      )}

      {started && (
        <>
          {/* BOTÓN PARA ACTIVAR/DESACTIVAR EL PREMIUM */}
          <div style={{ position: 'absolute', top: 30, right: 30, zIndex: 10 }}>
            <button
              onClick={() => {
                const newVal = !isPremiumEnabled;
                setIsPremiumEnabled(newVal);
                if (!newVal && typeof activeIndex === 'number' && activeIndex >= 6) {
                  setActiveIndex('premium_general');
                }
              }}
              style={{
                background: 'rgba(5, 5, 5, 0.85)',
                border: '1px solid rgba(200, 168, 83, 0.5)',
                borderRadius: '4px',
                padding: '8px 16px',
                color: isPremiumEnabled ? '#c8a853' : '#777',
                fontFamily: 'sans-serif',
                fontSize: '10px',
                letterSpacing: '1px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: isPremiumEnabled ? '0 0 10px rgba(200,168,83,0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {isPremiumEnabled ? "⭐ PREMIUM: HABILITADO" : "🔒 PREMIUM: DESHABILITADO"}
            </button>
          </div>

          {/* TARJETA MODAL EXCLUSIVA: SECCIÓN BLOQUEADA */}
          {activeIndex === 'premium_general' && !isPremiumEnabled && showPremiumModal && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '420px',
              background: 'rgba(5, 5, 5, 0.95)',
              border: '1px solid #c8a853',
              borderRadius: '8px',
              padding: '35px',
              color: 'white',
              fontFamily: 'serif',
              textAlign: 'center',
              zIndex: 200,
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)'
            }}>
              {/* BOTÓN CERRAR (✕) */}
              <button
                onClick={() => {
                  setShowPremiumModal(false); // Oculta el cartel
                }}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  color: '#777',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '300',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#c8a853'}
                onMouseLeave={(e) => e.target.style.color = '#777'}
              >
                ✕
              </button>

              <h2 style={{ fontSize: '20px', color: '#c8a853', letterSpacing: '4px', margin: '0 0 15px 0' }}>SANTUARIO PREMIUM</h2>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.6', margin: '0 0 25px 0', fontFamily: 'sans-serif' }}>
                Estás frente a los Balones de Oro y el Súper Balón de Oro de Alfredo Di Stéfano. Adquiere el Pase Premium para revelar los trofeos y examinarlos en detalle.
              </p>
              <button
                onClick={() => {
                  setIsPremiumEnabled(true);
                  setActiveIndex(6);
                }}
                style={{
                  background: 'linear-gradient(135deg, #c8a853, #b08d38)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px 28px',
                  color: 'black',
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(200, 168, 83, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                DESBLOQUEAR SECCIÓN PREMIUM
              </button>
            </div>
          )}

          {/* CONTROL DE NAVEGACIÓN COMPLETO */}
          <div style={{ position: 'absolute', bottom: 60, right: 60, zIndex: 10, display: 'flex', gap: '30px', fontFamily: 'sans-serif', letterSpacing: '2px', fontSize: '11px', alignItems: 'center' }}>
            <button
              onClick={() => {
                if (activeIndex === 0) {
                  setActiveIndex(null);
                } else if (activeIndex === 'premium_general') {
                  setActiveIndex(5);
                } else if (activeIndex === 6) {
                  setActiveIndex(5);
                } else if (activeIndex !== null) {
                  setActiveIndex(activeIndex - 1);
                }
              }}
              disabled={activeIndex === null}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: activeIndex === null ? 0.25 : 0.8, transition: 'opacity 0.2s' }}
            >
              ANTERIOR
            </button>

            <button
              onClick={() => setActiveIndex(null)}
              style={{
                background: 'rgba(200, 168, 83, 0.1)',
                border: '1px solid rgba(200, 168, 83, 0.3)',
                borderRadius: '4px',
                padding: '6px 14px',
                color: '#c8a853',
                cursor: 'pointer',
                opacity: activeIndex === null ? 0.5 : 1,
                transition: 'all 0.2s',
                fontWeight: 'bold'
              }}
            >
              VISTA GENERAL
            </button>

            <button
              onClick={() => {
                if (activeIndex === null) {
                  setActiveIndex(0);
                } else if (activeIndex === 5) {
                  if (isPremiumEnabled) {
                    setActiveIndex(6);
                  } else {
                    setActiveIndex('premium_general');
                  }
                } else if (activeIndex === 'premium_general') {
                  if (isPremiumEnabled) {
                    setActiveIndex(6);
                  }
                } else {
                  setActiveIndex(activeIndex + 1);
                }
              }}
              disabled={activeIndex === EXHIBITS.length - 1}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: activeIndex === EXHIBITS.length - 1 ? 0.25 : 0.8, transition: 'opacity 0.2s' }}
            >
              SIGUIENTE
            </button>
          </div>

          <Canvas shadows camera={{ position: [0, 2.2, 4.5], fov: 65 }} gl={{ toneMappingExposure: 1.15, antialias: true }}>
            <Suspense fallback={<Loader />}>
              <color attach="background" args={['#050505']} />

              {/* ATMÓSFERA CINEMÁTICA - APAGAMOS LA LUZ GENERAL PARA DEJAR SOLO COVES Y DICROICAS */}
              <Environment preset="studio" environmentIntensity={0.0} />

              <MuseumRoom />
              <PremiumPlatform />

              {EXHIBITS.map((ex, i) => (
                <PedestalStation
                  key={ex.id}
                  exhibit={ex}
                  isActive={i === activeIndex || (activeIndex === 'premium_general' && ex.type === 'premium')}
                  isPremiumEnabled={isPremiumEnabled}
                />
              ))}

              <TextLighting />
              <CorridorLighting />
              <WallSconces activeIndex={activeIndex} />

              {/* UNIFICADO GENERAL TEXT - MOVIDO AL LÍMITE SUPERIOR Y = 5.4 Y CON HALO DE LUZ NEUTRO MUY SUAVE */}
              <group position={[0, 5.4, -20.95]}>
                <pointLight position={[0, 0, 4.5]} color="#ffffff" intensity={4.5} distance={8.0} decay={1.1} />
                <Text
                  fontSize={0.22}
                  material={GOLD_TEXT_MATERIAL}
                  anchorX="center"
                  anchorY="middle"
                >
                  SANTUARIO BALONES DE ORO
                </Text>
                <Text
                  fontSize={0.11}
                  material={WHITE_TEXT_MATERIAL}
                  position={[0, -0.26, 0]}
                  anchorX="center"
                  anchorY="middle"
                  letterSpacing={0.06}
                >
                  ALFREDO DI STÉFANO   |   1957  •  1989  •  1959
                </Text>
                <Text
                  fontSize={0.068}
                  material={GREY_TEXT_MATERIAL}
                  position={[0, -0.56, 0]}
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={5.2}
                  textAlign="center"
                  lineHeight={1.6}
                >
                  Esta sección exclusiva alberga las reliquias más sagradas de la Saeta Rubia. Sus tres Balones de Oro y el legendario Súper Balón de Oro de 1989, el único trofeo de su clase en toda la historia del fútbol mundial.
                </Text>
              </group>

              <CameraRig activeIndex={activeIndex} />
            </Suspense>
          </Canvas>
        </>
      )}
    </div>
  );
}

// RESTAURAMOS EL PARÁMETRO ESTÁNDAR DE NAVEGACIÓN Y CARGA DE DREI QUE ANDABA PERFECTO ANTES
useGLTF.preload('/camiseta.glb');
useTexture.preload('/Wood051_4K-JPG_Color.jpg');
useTexture.preload('/Wood051_4K-JPG_NormalGL.jpg');
useTexture.preload('/Wood051_4K-JPG_Roughness.jpg');
useTexture.preload('/Road013A_4K-JPG_Color.jpg');
useTexture.preload('/Road013A_4K-JPG_NormalGL.jpg');
useTexture.preload('/Road013A_4K-JPG_Roughness.jpg');
useTexture.preload('/Road013A_4K-JPG_AmbientOcclusion.jpg');
useTexture.preload('/Fabric022_4K-JPG_Color.jpg');
useTexture.preload('/Fabric022_4K-JPG_NormalGL.jpg');
useTexture.preload('/Fabric022_4K-JPG_Roughness.jpg');
useTexture.preload('/Metal048C_4K-JPG_Color.jpg');