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
  Environment,
  Billboard
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import LandingLogin from './LandingLogin';

// --- CONFIGURACIÓN DE LA BÓVEDA ---
const ROOM_DEPTH = 38;
const ROOM_WIDTH = 11.5; // RESTAURADO a su tamaño original
const ROOM_HEIGHT = 6.2;

const DUMMY_TEXT = "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export const WAYPOINTS = [
  { id: 0, pos: [0, 0.05, -2], camPos: [0, 2.8, -2], targetPos: [0, 2.8, -3] },
  { id: 1, pos: [0, 0.05, -9], camPos: [0, 2.8, -9], targetPos: [0, 2.8, -10] },
  { id: 2, pos: [0, 0.05, -15.5], camPos: [0, 2.8, -15.5], targetPos: [0, 2.8, -16.5] },
  // Left Door
  { id: 3, pos: [-7.0, 0.05, -15.5], camPos: [-7.0, 2.8, -15.5], targetPos: [-14.0, 2.8, -15.5] },
  // VIP Room Left (-X)
  { id: 4, pos: [-14.0, 0.05, -15.5], camPos: [-14.0, 2.8, -15.5], targetPos: [-14.0, 2.8, -16.5] },
  // Right Door
  { id: 5, pos: [7.0, 0.05, -15.5], camPos: [7.0, 2.8, -15.5], targetPos: [14.0, 2.8, -15.5] },
  // VIP Room Right (+X)
  { id: 6, pos: [14.0, 0.05, -15.5], camPos: [14.0, 2.8, -15.5], targetPos: [14.0, 2.8, -16.5] },
];

export const EXHIBITS = [
  {
    id: 1,
    title: "Jordania",
    year: "2024",
    desc: "Descripción de Jordania. (Texto provisional, dime qué quieres poner aquí).",
    type: 'regular',
    pos: [-4.0, 0, -6.5],
    camPos: [-1.9, 3.2, -6.5],
    textPos: [-5.67, 4.2, -6.5],
    rotY: Math.PI / 2,
    isLeft: true,
    initialRotY: 0,
    audioUrl: "/Camiseta de Jodania/Jordania.mp3",
    imageUrl: "/Camiseta de Jodania/Jordania Kelme.jpeg",
    metadata: {
      description: `<h3 style="color: #00f0ff; margin-top: 0;">Los Guerreros del Desierto</h3>
<b>Representando el orgullo de Jordania</b>, esta camiseta de Kelme une a la nación en el campo de fútbol.<br/><br/>
En el corazón de Oriente Medio, la selección nacional de Jordania muestra <b>resiliencia y pasión</b>. Son el emblema de un país conocido mundialmente por la impresionante ciudad antigua de Petra y por albergar el punto más bajo en la Tierra, el Mar Muerto.<br/><br/>
¡Viste el rojo de Jordania y siente el espíritu indomable de su gente!`,
      origin: "Jordania",
      history: "Historia provisional.",
      material: "Material provisional."
    }
  },
  {
    id: 2,
    title: "Sri Lanka",
    year: "2024",
    desc: "Descripción de Sri Lanka. (Texto provisional, dime qué quieres poner aquí).",
    type: 'regular',
    pos: [4.0, 0, -6.5],
    camPos: [1.9, 3.2, -6.5],
    textPos: [5.67, 4.2, -6.5],
    rotY: -Math.PI / 2,
    isLeft: false,
    initialRotY: 0,
    audioUrl: "/Camiseta de Sri Lanka/Srilanka.mp3",
    imageUrl: "/Camiseta de Sri Lanka/Sri Lanka.jpeg",
    metadata: {
      description: `<h3 style="color: #00f0ff; margin-top: 0;">El león que busca su lugar</h3>
Esta camiseta blanca de <b>Sri Lanka</b> es la combinación perfecta entre modernidad y simbolismo.<br/>
El diseño dinámico de puntos en movimiento representa la energía y la evolución constante. Los tonos azul y amarillo refuerzan los colores que acompañan al león dorado del escudo nacional, uno de los emblemas más antiguos y potentes de todo el sur de Asia.<br/><br/>
Sri Lanka es una isla estratégica del Océano Índico, históricamente conocida como Ceilán, y un punto clave en las rutas comerciales entre Oriente y Occidente. Su vibrante cultura mezcla influencias budistas, tamiles y coloniales, y ese rico cruce de caminos también se ve reflejado en su identidad deportiva.<br/><br/>
Si bien el cricket es el deporte dominante en la isla, el fútbol ha ido creciendo de a poco como un espacio de representación internacional. La selección compite en la Confederación Asiática y es miembro de la FIFA desde 1952. Uno de sus momentos más recordados llegó en la década de los 90, logrando grandes actuaciones en el Campeonato del Sur de Asia (SAFF).<br/><br/>
Esta camiseta no representa solo resultados, <b>representa aspiración</b>. Es la piel de una nación insular que, llevando el león en el pecho, sigue buscando su rugido propio en el fútbol asiático.`,
      origin: "Sri Lanka",
      history: "Historia provisional.",
      material: "Material provisional."
    }
  },
  {
    id: 3,
    title: "Palestina",
    year: "2024",
    desc: "Descripción de Palestina. (Texto provisional, dime qué quieres poner aquí).",
    type: 'regular',
    pos: [-4.0, 0, -12.0],
    camPos: [-1.9, 3.2, -12.0],
    textPos: [-5.67, 4.2, -12.0],
    rotY: Math.PI / 2,
    isLeft: true,
    initialRotY: 0,
    audioUrl: "/Palestina Kelme/Palestina.mp3",
    imageUrl: "/Palestina Kelme/Palestina Kelme.jpeg",
    metadata: {
      description: `<h3 style="color: #00f0ff; margin-top: 0;">Fútbol como identidad y resistencia</h3>
Esta camiseta blanca de <b>Palestina</b> no es solo una prenda deportiva; es un símbolo poderoso.<br/>
El color blanco transmite pureza y esperanza, mientras que los detalles en verde, negro y rojo evocan directamente los colores nacionales, representando su historia, su resistencia y su sentido de pertenencia.<br/><br/>
En el plano futbolístico, la selección compite oficialmente bajo la <b>Federación Palestina de Fútbol</b>, afiliada a la FIFA desde 1998 y miembro activo de la Confederación Asiática. En este contexto, el fútbol trasciende completamente el deporte: se convierte en <b>identidad colectiva</b>, en una bandera y en un mensaje para el mundo entero.<br/><br/>
A pesar de que muchos jugadores han tenido que entrenar y competir en condiciones sumamente complejas, el equipo ha logrado hitos históricos. El momento más brillante llegó en <b>2014</b>, cuando Palestina conquistó la <b>AFC Challenge Cup</b>, clasificándose por primera vez a la Copa Asiática 2015. Esa victoria significó mucho más que levantar un título: representó un reconocimiento internacional inmenso y una celebración de unidad nacional.<br/><br/>
Cada vez que esta camiseta pisa el campo, no juegan solo once futbolistas. Juega una historia milenaria y la profunda convicción de que el fútbol es una forma de existir y visibilizarse globalmente.`,
      origin: "Palestina",
      history: "Historia provisional.",
      material: "Material provisional."
    }
  },
  {
    id: 4,
    title: "Kuwait",
    year: "2024",
    desc: "Descripción de Kuwait. (Texto provisional, dime qué quieres poner aquí).",
    type: 'regular',
    pos: [4.0, 0, -12.0],
    camPos: [1.9, 3.2, -12.0],
    textPos: [5.67, 4.2, -12.0],
    rotY: -Math.PI / 2,
    isLeft: false,
    initialRotY: 0,
    audioUrl: "/Camiseta de Kuwait/Kuwait.mp3",
    imageUrl: "/Camiseta de Kuwait/Kuwait Adidas.jpeg",
    metadata: {
      description: `<h3 style="color: #00f0ff; margin-top: 0;">Elegancia del Golfo, Historia en Asia</h3>
Esta camiseta color arena no es casualidad. Representa a <b>Kuwait</b>, un país pequeño en territorio pero enorme en historia futbolística dentro del mundo árabe y asiático.<br/><br/>
El tono beige evoca el desierto del Golfo Pérsico, pero también transmite sobriedad y tradición. Sus líneas limpias y el sutil diseño geométrico reflejan una cultura que combina la modernidad petrolera con sus profundas raíces beduinas.<br/><br/>
<b>Una Potencia Histórica</b><br/>
En el plano futbolístico, Kuwait fue una verdadera potencia asiática en los años 70 y 80. Ganó la <b>Copa Asiática 1980</b> y disputó el <b>Mundial de España 1982</b>, convirtiéndose en una de las primeras selecciones del Golfo en jugar una Copa del Mundo. Allí protagonizó uno de los episodios más recordados del torneo: en el partido ante Francia, un gol fue inicialmente validado y luego anulado tras una protesta histórica que quedó como una anécdota mundialista inolvidable.<br/><br/>
Además, Kuwait dominó varias ediciones de la Copa del Golfo, consolidándose como el referente absoluto de su región durante décadas.<br/><br/>
Esta camiseta no solo viste a un equipo, viste <b>una etapa dorada del fútbol asiático</b> y la ambición de un país que logró plantarse firme en el escenario global. Una prenda que respira identidad, orgullo y memoria futbolera.`,
      origin: "Kuwait",
      history: "Historia provisional.",
      material: "Material provisional."
    }
  },
  {
    id: 5,
    title: "Ricardo Bochini",
    year: "1970s-80s",
    desc: "El maestro de la pausa, ídolo eterno del Club Atlético Independiente. (Texto provisorio a la espera de la transcripción).",
    type: 'premium',
    pos: [-14.0, 0, -11.0],
    camPos: [-14.0, 3.2, -13.5],
    textPos: [-14.0, 4.2, -11.0],
    rotY: Math.PI,
    isCenter: true,
    initialRotY: 0,
    audioUrl: "/Camiseta homenaje a Boccini/Boccini 2 (mejor).mp3",
    imageUrl: "/Camiseta homenaje a Boccini/Camsieta de Boccini autografiada.jpeg",
    metadata: {
      description: `<h3 style="color: #00f0ff; margin-top: 0;">El Bocha</h3>
<b>(PROVISORIO)</b> Estoy a la espera de la transcripción oficial del audio. Mientras tanto, este espacio rinde homenaje al maestro indiscutido del mediocampo de Independiente.
Su visión de juego, la famosa "pausa" y sus pases milimétricos forjaron la época dorada del club de Avellaneda, coronándose multicampeón de América y del mundo.`,
      origin: "Avellaneda, Argentina",
      history: "Ícono absoluto de Independiente y del fútbol argentino.",
      material: "Camiseta autografiada en homenaje a su trayectoria."
    }
  },
  {
    id: 6,
    title: "Juan Sebastián Verón",
    year: "2012",
    desc: "La Brujita. Símbolo, capitán y presidente de Estudiantes de La Plata. (Texto provisorio a la espera de la transcripción).",
    type: 'premium',
    pos: [-14.0, 0, -20.0],
    camPos: [-14.0, 3.2, -17.5],
    textPos: [-14.0, 4.2, -20.0],
    rotY: 0,
    isCenter: true,
    initialRotY: 0,
    audioUrl: "/Camseta Bruja Veron/Bruja Veron.mp3",
    imageUrl: "/Camseta Bruja Veron/Bruja 2012 Estudiantes.jpeg",
    metadata: {
      description: `<h3 style="color: #00f0ff; margin-top: 0;">La Brujita</h3>
<b>(PROVISORIO)</b> Estoy a la espera del texto oficial que acompaña este audio. 
Verón es el emblema definitivo de Estudiantes de La Plata en el siglo XXI. Lideró al equipo hacia la conquista de la Copa Libertadores en 2009 con su magistral pegada, liderazgo implacable y amor incondicional por la camiseta pincharrata.`,
      origin: "La Plata, Argentina",
      history: "Regresó de Europa para devolverle la gloria a su amado club.",
      material: "Camiseta de Estudiantes modelo 2012."
    }
  },
  {
    id: 7,
    title: "El Legado Continental",
    year: "1962",
    desc: "Aunque el Madrid cayó en la final, la influencia de Di Stéfano seguía dominando Europa.",
    type: 'premium',
    pos: [14.0, 0, -11.0],
    camPos: [14.0, 3.2, -13.5],
    textPos: [14.0, 4.2, -11.0],
    rotY: Math.PI,
    isCenter: true,
    initialRotY: 0,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    metadata: {
      description: "El eterno liderazgo continuó a lo largo de los 60s.",
      origin: "Europa",
      history: "Revolución táctica del Real Madrid.",
      material: "Algodón clásico de los años 60."
    }
  },
  {
    id: 8,
    title: "La Leyenda Viva",
    year: "1964",
    desc: "Sus últimos destellos europeos con el Madrid antes de dejar el club como el mejor jugador de su historia.",
    type: 'premium',
    pos: [14.0, 0, -20.0],
    camPos: [14.0, 3.2, -17.5],
    textPos: [14.0, 4.2, -20.0],
    rotY: 0,
    isCenter: true,
    initialRotY: 0,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    metadata: {
      description: "El adiós de una época inigualable.",
      origin: "Madrid",
      history: "La huella imborrable del jugador más importante de la historia blanca.",
      material: "Camiseta de su última temporada gloriosa."
    }
  }
];

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
      <mesh position={[0, -0.148, 0]}>
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
    <mesh position={[0, -0.148 - height / 2, 0]} raycast={() => null}>
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

const PORTRAIT_TEXT_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: "#ffd700", // Bright gold
  roughness: 0.1,
  metalness: 1.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  emissive: new THREE.Color("#332200") // Warm glow
});

// --- ARQUITECTURA ELEGANTE DE CONCRETO CON SALA CONTIGUA ---
const MuseumRoom = ({ setActiveIndex }) => {
  const [hovered, setHovered] = useState(false);
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

  const [floorConcreteColor, floorConcreteNormal, floorConcreteRough] = useTexture([
    '/Road013A_4K-JPG_Color.jpg',
    '/Road013A_4K-JPG_NormalGL.jpg',
    '/Road013A_4K-JPG_Roughness.jpg'
  ]);

  const [brickColor, brickNormal, brickRough, brickAO] = useTexture([
    '/Bricks058_4K-JPG_Color.jpg',
    '/Bricks058_4K-JPG_NormalGL.jpg',
    '/Bricks058_4K-JPG_Roughness.jpg',
    '/Bricks058_4K-JPG_AmbientOcclusion.jpg'
  ]);

  const [grassColor, grassNormal, grassRough, grassAO] = useTexture([
    '/Grass005_4K-JPG_Color.jpg',
    '/Grass005_4K-JPG_NormalGL.jpg',
    '/Grass005_4K-JPG_Roughness.jpg',
    '/Grass005_4K-JPG_AmbientOcclusion.jpg'
  ]);

  const grassColorTex = useMemo(() => {
    const t = grassColor.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(24, 24); t.needsUpdate = true; return t;
  }, [grassColor]);
  const grassNormalTex = useMemo(() => {
    const t = grassNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(24, 24); t.needsUpdate = true; return t;
  }, [grassNormal]);
  const grassRoughTex = useMemo(() => {
    const t = grassRough.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(24, 24); t.needsUpdate = true; return t;
  }, [grassRough]);
  const grassAOTex = useMemo(() => {
    const t = grassAO.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(24, 24); t.needsUpdate = true; return t;
  }, [grassAO]);

  const [rockColor, rockNormal, rockRough, rockAO] = useTexture([
    '/Rock035_4K-JPG_Color.jpg',
    '/Rock035_4K-JPG_NormalGL.jpg',
    '/Rock035_4K-JPG_Roughness.jpg',
    '/Rock035_4K-JPG_AmbientOcclusion.jpg'
  ]);

  const [muralMaradona, muralMessi, muralBochini, muralVeron] = useTexture([
    '/muralmaradona1.png',
    '/muralmessi1.png',
    '/muralbochini.png',
    '/muralveron.png'
  ]);

  const rockColorTex = useMemo(() => {
    const t = rockColor.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); t.needsUpdate = true; return t;
  }, [rockColor]);
  const rockNormalTex = useMemo(() => {
    const t = rockNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); t.needsUpdate = true; return t;
  }, [rockNormal]);
  const rockRoughTex = useMemo(() => {
    const t = rockRough.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); t.needsUpdate = true; return t;
  }, [rockRough]);
  const rockAOTex = useMemo(() => {
    const t = rockAO.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); t.needsUpdate = true; return t;
  }, [rockAO]);

  // Ladrillos de paredes principales laterales (Copiada escala del Santuario para consistencia mate)
  const wallBrickColor = useMemo(() => {
    const t = brickColor.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 3); t.needsUpdate = true; return t;
  }, [brickColor]);
  const wallBrickNormal = useMemo(() => {
    const t = brickNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 3); t.needsUpdate = true; return t;
  }, [brickNormal]);
  const wallBrickRough = useMemo(() => {
    const t = brickRough.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 3); t.needsUpdate = true; return t;
  }, [brickRough]);
  const wallBrickAO = useMemo(() => {
    const t = brickAO.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 3); t.needsUpdate = true; return t;
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

  const vipCeilingConcreteNormal = useMemo(() => {
    const t = concreteNormal.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2); // Reduced from 4,4 to fix intense noise
    t.rotation = Math.PI / 2;
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

  // Polished Concrete Floor Textures
  const floorColorTex = useMemo(() => {
    const t = floorConcreteColor.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 18); // Adjusted scale for concrete (15x70m proportion)
    t.needsUpdate = true;
    return t;
  }, [floorConcreteColor]);

  const floorNormalTex = useMemo(() => {
    const t = floorConcreteNormal.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 18);
    t.needsUpdate = true;
    return t;
  }, [floorConcreteNormal]);

  const floorRoughTex = useMemo(() => {
    const t = floorConcreteRough.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 18);
    t.needsUpdate = true;
    return t;
  }, [floorConcreteRough]);

  const ceilingMaterialProps = {
    normalMap: ceilingConcreteNormal,
    normalScale: new THREE.Vector2(0.42, 0.42), // Relieve tridimensional nítido de las juntas de placas gigantes brutalistas
    color: "#9c9c9c", // Gris sólido limpio y elegante de cemento real
    roughness: 1.0, // 100% mate absoluto, elimina cualquier reflejo especular o brillo de bombillas
    metalness: 0.0,
    side: THREE.DoubleSide
  };

  const vipCeilingMaterialProps = {
    normalMap: vipCeilingConcreteNormal,
    normalScale: new THREE.Vector2(0.42, 0.42),
    color: "#9c9c9c",
    roughness: 1.0,
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
    color: "#242424", // Grafito oscuro profundo elegante
    roughness: 1.0,
    metalness: 0.0
  };

  const backWallConcreteProps = {
    normalMap: backBrickNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    color: "#242424", // Grafito oscuro unificado
    roughness: 1.0,
    metalness: 0.0
  };

  const edgeBrickColor = useMemo(() => {
    const t = brickColor.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.234, 3); t.needsUpdate = true; return t;
  }, [brickColor]);
  const edgeBrickNormal = useMemo(() => {
    const t = brickNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.234, 3); t.needsUpdate = true; return t;
  }, [brickNormal]);
  const edgeBrickRough = useMemo(() => {
    const t = brickRough.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.234, 3); t.needsUpdate = true; return t;
  }, [brickRough]);
  const edgeBrickAO = useMemo(() => {
    const t = brickAO.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.234, 3); t.needsUpdate = true; return t;
  }, [brickAO]);

  const edgeWallMaterialProps = {
    map: edgeBrickColor,
    normalMap: edgeBrickNormal,
    roughnessMap: edgeBrickRough,
    aoMap: edgeBrickAO,
    color: "#222222",
    roughness: 0.9,
    metalness: 0.1
  };

  const backRoomProps = {
    normalMap: backRoomBrickColor, // Usando como relieve para la sala trasera
    color: "#242424", // Grafito oscuro unificado
    roughness: 1.0, // 100% mate total
    metalness: 0.0
  };

  const vipWallColor = useMemo(() => {
    const t = woodColor.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.needsUpdate = true; return t;
  }, [woodColor]);
  const vipWallNormal = useMemo(() => {
    const t = woodNormal.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.needsUpdate = true; return t;
  }, [woodNormal]);
  const vipWallRough = useMemo(() => {
    const t = woodRough.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.needsUpdate = true; return t;
  }, [woodRough]);

  const vipWallProps = {
    color: "#242424", // Grafito oscuro profundo elegante, igual a sala principal
    roughness: 1.0,
    metalness: 0.0
  };

  const floorMaterialProps = {
    map: floorColorTex,
    normalMap: floorNormalTex,
    roughnessMap: floorRoughTex,
    color: '#6b6b6b', // Darkened per feedback
    roughness: 1.5,
    metalness: 0.1
  };

  const vipFloorProps = {
    map: grassColorTex,
    normalMap: grassNormalTex,
    aoMap: grassAOTex,
    roughnessMap: grassRoughTex,
    color: "#ffffff", // Use original texture colors for synthetic look
    roughness: 1.0,
    metalness: 0.0
  };

  return (
    <group>
      {/* PISO PRINCIPAL EXTENDIDO HASTA Z = -62.5 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -27.5]} receiveShadow>
        <planeGeometry args={[11.5, 70]} />
        <meshPhysicalMaterial
          map={floorColorTex}
          normalMap={floorNormalTex}
          normalScale={new THREE.Vector2(0.01, 0.01)}
          color="#a5a5a5"
          roughness={0.7}
          metalness={0.1}
          clearcoat={0.1}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* ALAS DEL PISO PARA SALAS LATERALES VIP (Z=-8 a -23, Ancho=16) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-13.75, 0, -15.5]} receiveShadow>
        <planeGeometry args={[16, 15]} />
        <meshStandardMaterial {...vipFloorProps} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13.75, 0, -15.5]} receiveShadow>
        <planeGeometry args={[16, 15]} />
        <meshStandardMaterial {...vipFloorProps} />
      </mesh>

      {/* CIELORRASO BRUTALISTA CON ESTRUCTURA DE FOSO */}
      <group>
        {/* Techo principal central completo (11.5m ancho) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, -27.5]} receiveShadow>
          <planeGeometry args={[11.5, 70]} />
          <meshStandardMaterial {...ceilingMaterialProps} />
        </mesh>

        {/* Alas de Techo para las salas laterales VIP */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[-13.75, ROOM_HEIGHT, -15.5]} receiveShadow>
          <planeGeometry args={[16, 15]} />
          <meshStandardMaterial {...vipCeilingMaterialProps} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[13.75, ROOM_HEIGHT, -15.5]} receiveShadow>
          <planeGeometry args={[16, 15]} />
          <meshStandardMaterial {...vipCeilingMaterialProps} />
        </mesh>

        {/* 2. Techos Laterales (Más bajos, Ensanchados, Y = ROOM_HEIGHT - 0.4 = 4.6) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[-4.475, ROOM_HEIGHT - 0.4, -27.5]} receiveShadow>
          <planeGeometry args={[2.55, 70]} />
          <meshStandardMaterial {...sideCeilingMaterialProps} />
        </mesh>
        
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[4.475, ROOM_HEIGHT - 0.4, -27.5]} receiveShadow>
          <planeGeometry args={[2.55, 70]} />
          <meshStandardMaterial {...sideCeilingMaterialProps} />
        </mesh>

        {/* 3. Paredes Verticales Internas del Foso (Conectan techo alto con bajos, Z=70m) */}
        <mesh position={[-3.2, ROOM_HEIGHT - 0.2, -27.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
          <planeGeometry args={[70, 0.4]} />
          <meshStandardMaterial {...edgeWallMaterialProps} />
        </mesh>
        
        <mesh position={[3.2, ROOM_HEIGHT - 0.2, -27.5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
          <planeGeometry args={[70, 0.4]} />
          <meshStandardMaterial {...edgeWallMaterialProps} />
        </mesh>

        {/* 4. Luces Direccionales Ocultas en los Fosos */}
        {[-3, -8, -13, -18, -23, -28].map((zPos, idx) => {
          return (
            <group key={`foso-lights-${idx}`}>
              <pointLight
                position={[-3.18, ROOM_HEIGHT - 0.05, zPos]}
                intensity={0.6}
                distance={16.0}
                decay={0.5}
                color="#ffffff"
              />
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
      </group>

      {/* --- PAREDES DE LA SALA PRINCIPAL (Con aberturas laterales) --- */}
      {/* Pared Lateral Izquierda */}
      {/* Segmento Frontal */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5.75, ROOM_HEIGHT / 2, -6.0]} receiveShadow>
        <planeGeometry args={[14, ROOM_HEIGHT]} />
        <meshStandardMaterial {...sideWallMaterialProps} />
      </mesh>
      {/* Dintel Izquierdo */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5.75, 5.1, -15.5]} receiveShadow>
        <planeGeometry args={[5, 2.2]} />
        <meshStandardMaterial {...sideWallMaterialProps} />
      </mesh>
      {/* Segmento Trasero */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5.75, ROOM_HEIGHT / 2, -20.0]} receiveShadow>
        <planeGeometry args={[4, ROOM_HEIGHT]} />
        <meshStandardMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Pared Lateral Derecha */}
      {/* Segmento Frontal */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5.75, ROOM_HEIGHT / 2, -6.0]} receiveShadow>
        <planeGeometry args={[14, ROOM_HEIGHT]} />
        <meshStandardMaterial {...sideWallMaterialProps} />
      </mesh>
      {/* Dintel Derecho */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5.75, 5.1, -15.5]} receiveShadow>
        <planeGeometry args={[5, 2.2]} />
        <meshStandardMaterial {...sideWallMaterialProps} />
      </mesh>
      {/* Segmento Trasero */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5.75, ROOM_HEIGHT / 2, -20.0]} receiveShadow>
        <planeGeometry args={[4, ROOM_HEIGHT]} />
        <meshStandardMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* Pared de Entrada (Z=1) */}
      <mesh position={[0, ROOM_HEIGHT / 2, 1.0]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[11.5, ROOM_HEIGHT]} />
        <meshStandardMaterial {...backWallConcreteProps} />
      </mesh>

      {/* Pared Trasera de la Sala Principal (Z=-22) */}
      <mesh position={[0, ROOM_HEIGHT / 2, -22.0]} receiveShadow>
        <planeGeometry args={[11.5, ROOM_HEIGHT]} />
        <meshStandardMaterial {...backWallConcreteProps} />
      </mesh>

      {/* --- PAREDES DE SALAS LATERALES VIP (16x15m) --- */}
      {/* SALA LATERAL IZQUIERDA VIP */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-21.75, ROOM_HEIGHT / 2, -15.5]} receiveShadow>
        <planeGeometry args={[15, ROOM_HEIGHT]} />
        <meshStandardMaterial {...vipWallProps} />
      </mesh>
      <mesh rotation={[0, 0, 0]} position={[-13.75, ROOM_HEIGHT / 2, -23.0]} receiveShadow>
        <planeGeometry args={[16, ROOM_HEIGHT]} />
        <meshStandardMaterial {...sideWallMaterialProps} />
      </mesh>
      
      {/* MURAL VERÓN (Fondo) */}
      <mesh rotation={[0, 0, 0]} position={[-13.75, ROOM_HEIGHT / 2, -22.95]}>
        <planeGeometry args={[16, ROOM_HEIGHT]} />
        <meshStandardMaterial 
          map={muralVeron} 
          emissiveMap={muralVeron} 
          emissive="#ffffff" 
          emissiveIntensity={0.25} 
          roughness={0.9}
        />
      </mesh>

      <mesh rotation={[0, Math.PI, 0]} position={[-13.75, ROOM_HEIGHT / 2, -8.0]} receiveShadow>
        <planeGeometry args={[16, ROOM_HEIGHT]} />
        <meshStandardMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* MURAL BOCHINI (Frente) */}
      <mesh rotation={[0, Math.PI, 0]} position={[-13.75, ROOM_HEIGHT / 2, -8.05]}>
        <planeGeometry args={[16, ROOM_HEIGHT]} />
        <meshStandardMaterial 
          map={muralBochini} 
          emissiveMap={muralBochini} 
          emissive="#ffffff" 
          emissiveIntensity={0.25} 
          roughness={0.9}
        />
      </mesh>
      {/* Segmentos de pared internos para cerrar el VIP (Junto al pasillo principal, orientados hacia adentro del VIP) */}
      {/* Segmento Frontal Inner */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[-6.25, ROOM_HEIGHT / 2, -10.5]} receiveShadow>
        <planeGeometry args={[5, ROOM_HEIGHT]} />
        <meshStandardMaterial {...vipWallProps} />
      </mesh>
      {/* Segmento Trasero Inner */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[-6.25, ROOM_HEIGHT / 2, -20.5]} receiveShadow>
        <planeGeometry args={[5, ROOM_HEIGHT]} />
        <meshStandardMaterial {...vipWallProps} />
      </mesh>
      {/* Dintel Izquierdo Inner */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[-6.25, 5.1, -15.5]} receiveShadow>
        <planeGeometry args={[5, 2.2]} />
        <meshStandardMaterial {...vipWallProps} />
      </mesh>

      {/* SALA LATERAL DERECHA VIP */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[21.75, ROOM_HEIGHT / 2, -15.5]} receiveShadow>
        <planeGeometry args={[15, ROOM_HEIGHT]} />
        <meshStandardMaterial {...vipWallProps} />
      </mesh>
      <mesh rotation={[0, 0, 0]} position={[13.75, ROOM_HEIGHT / 2, -23.0]} receiveShadow>
        <planeGeometry args={[16, ROOM_HEIGHT]} />
        <meshStandardMaterial {...sideWallMaterialProps} />
      </mesh>
      
      {/* MURAL MESSI (Fondo) */}
      <mesh rotation={[0, 0, 0]} position={[13.75, ROOM_HEIGHT / 2, -22.95]}>
        <planeGeometry args={[16, ROOM_HEIGHT]} />
        <meshStandardMaterial 
          map={muralMessi} 
          emissiveMap={muralMessi} 
          emissive="#ffffff" 
          emissiveIntensity={0.25} 
          roughness={0.9}
        />
      </mesh>

      <mesh rotation={[0, Math.PI, 0]} position={[13.75, ROOM_HEIGHT / 2, -8.0]} receiveShadow>
        <planeGeometry args={[16, ROOM_HEIGHT]} />
        <meshStandardMaterial {...sideWallMaterialProps} />
      </mesh>

      {/* MURAL MARADONA (Frente) */}
      <mesh rotation={[0, Math.PI, 0]} position={[13.75, ROOM_HEIGHT / 2, -8.05]}>
        <planeGeometry args={[16, ROOM_HEIGHT]} />
        <meshStandardMaterial 
          map={muralMaradona} 
          emissiveMap={muralMaradona} 
          emissive="#ffffff" 
          emissiveIntensity={0.25} 
          roughness={0.9}
        />
      </mesh>
      {/* Segmentos de pared internos para cerrar el VIP (orientados hacia adentro del VIP) */}
      {/* Segmento Frontal Inner */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[6.25, ROOM_HEIGHT / 2, -10.5]} receiveShadow>
        <planeGeometry args={[5, ROOM_HEIGHT]} />
        <meshStandardMaterial {...vipWallProps} />
      </mesh>
      {/* Segmento Trasero Inner */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[6.25, ROOM_HEIGHT / 2, -20.5]} receiveShadow>
        <planeGeometry args={[5, ROOM_HEIGHT]} />
        <meshStandardMaterial {...vipWallProps} />
      </mesh>
      {/* Dintel Derecho Inner */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[6.25, 5.1, -15.5]} receiveShadow>
        <planeGeometry args={[5, 2.2]} />
        <meshStandardMaterial {...vipWallProps} />
      </mesh>

      {/* --- ESPESOR DE LOS ARCOS (PORTALES VIP) --- */}
      {/* Portal Izquierdo */}
      <mesh rotation={[0, Math.PI, 0]} position={[-6.0, ROOM_HEIGHT / 2, -13.0]} receiveShadow>
        <planeGeometry args={[0.5, ROOM_HEIGHT]} />
        <meshStandardMaterial {...edgeWallMaterialProps} />
      </mesh>
      <mesh rotation={[0, 0, 0]} position={[-6.0, ROOM_HEIGHT / 2, -18.0]} receiveShadow>
        <planeGeometry args={[0.5, ROOM_HEIGHT]} />
        <meshStandardMaterial {...edgeWallMaterialProps} />
      </mesh>
      {/* Dintel Portal Izquierdo (Techo del arco) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-6.0, 4.0, -15.5]} receiveShadow>
        <planeGeometry args={[0.5, 5.0]} />
        <meshStandardMaterial {...edgeWallMaterialProps} />
      </mesh>

      {/* Portal Derecho */}
      <mesh rotation={[0, Math.PI, 0]} position={[6.0, ROOM_HEIGHT / 2, -13.0]} receiveShadow>
        <planeGeometry args={[0.5, ROOM_HEIGHT]} />
        <meshStandardMaterial {...edgeWallMaterialProps} />
      </mesh>
      <mesh rotation={[0, 0, 0]} position={[6.0, ROOM_HEIGHT / 2, -18.0]} receiveShadow>
        <planeGeometry args={[0.5, ROOM_HEIGHT]} />
        <meshStandardMaterial {...edgeWallMaterialProps} />
      </mesh>
      {/* Dintel Portal Derecho (Techo del arco) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[6.0, 4.0, -15.5]} receiveShadow>
        <planeGeometry args={[0.5, 5.0]} />
        <meshStandardMaterial {...edgeWallMaterialProps} />
      </mesh>

      {/* TEXTO SOBRE ENTRADA SALA IZQUIERDA */}
      <Text
        position={[-5.73, 4.6, -15.5]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.3}
        material={GREY_TEXT_MATERIAL}
        anchorX="center"
        anchorY="middle"
      >
        SALA 2 : LEYENDAS
      </Text>

      {/* TEXTO SOBRE ENTRADA SALA DERECHA */}
      <Text
        position={[5.73, 4.6, -15.5]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.3}
        material={GREY_TEXT_MATERIAL}
        anchorX="center"
        anchorY="middle"
      >
        SALA 3 : DIOSES
      </Text>

      {/* LUZ AMBIENTAL CÁLIDA ELIMINADA PARA NO CONTAMINAR LOS MURALES */}

      {/* PANEL DE MÁRMOL NEGRO PULIDO DE FONDO PARA EL CUADRO */}
      <mesh position={[0, 2.3, -21.98]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 3.8, 0.05]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.15} metalness={0.8} />
      </mesh>

      {/* CUADRO DE ALFREDO DI STÉFANO CON RELACIÓN DE ASPECTO 1.5 CORRECTA (1200x800) */}
      <group
        onClick={(e) => { e.stopPropagation(); if (setActiveIndex) setActiveIndex('painting'); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      >
        {/* Marco 3D de madera oscura/negra */}
        <mesh position={[0, 2.3, -21.95]} castShadow receiveShadow>
          <boxGeometry args={[5.0, 3.4, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.75} metalness={0.1} />
        </mesh>
        {/* Lienzo del cuadro (relación de aspecto 1.5 - ej: 1200x800) */}
        <mesh position={[0, 2.3, -21.89]} castShadow receiveShadow>
          <planeGeometry args={[4.6, 3.0]} />
          <meshStandardMaterial map={distefanoTex} emissive={new THREE.Color("#050505")} emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* TEXTO DORADO ELEGANTE */}
      <Text
        position={[0, 4.8, -21.92]}
        rotation={[0, 0, 0]}
        fontSize={0.32}
        material={PORTRAIT_TEXT_MATERIAL}
        anchorX="center"
        anchorY="middle"
      >
        LA SAETA RUBIA
      </Text>

      {/* LUMINARIA DICROICA FÍSICA PARA EL RETRATO (NEGRO MATE CORTO Y ELEGANTE) */}
      <group position={[0, 6.2, -19.8]} rotation={[0.45, 0, 0]}>
        <mesh castShadow={false} position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.148, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* TARGET LOCAL PARA EL FOCO DEL CUADRO */}
      <object3D ref={setPortraitTarget} position={[0, 2.3, -21.85]} />

      {/* LUZ DE DICROICA ESTÁTICA Y TENUE DIRIGIDA AL CUADRO (EVITA CUALQUIER AS EN EL TECHO Y PISO) */}
      <spotLight
        position={[0, 5.75, -19.8]} // Bajado ligeramente para evitar colisión con el techo
        target={portraitTarget}
        angle={0.45} // Haz más estrecho y preciso
        penumbra={0.2} // Penumbra baja para evitar dispersión hacia atrás
        intensity={6.0}
        color="#ffffff" // Luz blanca pura neutra sin tintes
        distance={15} // Distancia ajustada para bañar el cuadro de manera suave
        decay={1.2}
        castShadow={false} // No se necesitan sombras para iluminación suave decorativa
      />

      {/* PUERTA/PASILLO DE ENTRADA EN LA PARED LATERAL IZQUIERDA (X = -7.5, Z = -0.8) */}
      <group>
        {/* Fondo negro de la puerta (rehundido en la pared para dar efecto de profundidad) */}
        <mesh position={[-7.52, 1.8, -0.8]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.2, 3.6]} />
          <meshBasicMaterial color="#010101" />
        </mesh>
        {/* Marco elegante de metal oscuro que sobresale de la pared */}
        <mesh position={[-7.48, 1.8, -0.8]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[2.3, 3.7, 0.06]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* Tapa interior del marco para mantener el vacío negro */}
        <mesh position={[-7.51, 1.8, -0.8]} rotation={[0, Math.PI / 2, 0]}>
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
    <Float speed={active ? 1.8 : 0.8} rotationIntensity={active ? 0.2 : 0} floatIntensity={0.3} floatingRange={[-0.05, 0.05]}>
      <group position={[0, 2.5, 0]} ref={group}>
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

const WaypointNode = ({ waypoint, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current && !isActive) {
      ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  if (isActive) return null;

  return (
    <group 
      position={waypoint.pos} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }} 
      onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} ref={ringRef}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial color={hovered ? "#ffffff" : "#c5a059"} transparent opacity={hovered ? 0.9 : 0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.25, 32]} />
        <meshBasicMaterial color={hovered ? "#ffffff" : "#c5a059"} transparent opacity={hovered ? 0.4 : 0.25} />
      </mesh>
    </group>
  );
};

const PedestalStation = ({ exhibit, isActive, isPremiumEnabled, onClick }) => {
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

  const actualCeilingHeight = ROOM_HEIGHT;
  const wallCeilingHeight = ROOM_HEIGHT - 0.4;
  const lightOffsetX = exhibit.isCenter ? 0 : (exhibit.isLeft ? 1.5 : -1.5);
  const ceilingLightPos = [exhibit.pos[0] + lightOffsetX, actualCeilingHeight, exhibit.pos[2]];

  const targetX = exhibit.isCenter ? exhibit.pos[0] : (exhibit.isLeft ? -6.2 : 6.2);
  const targetY = exhibit.type === 'premium' ? 1.6 : 0.5;

  const spotAngle = exhibit.type === 'premium' ? 0.45 : 0.4;

  const lightRef = useRef();
  const [localTarget, setLocalTarget] = useState(null);



  // REF PARA EL BAÑADOR DE PARED DORADO (WALL WASHER)
  const upLightRef = useRef();
  
  const [hovered, setHovered] = useState(false);

  // --- AUDIO AND INTERACTIVE PANEL STATES ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [activeTab, setActiveTab] = useState('description');
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef(null);

  // Initialize and handle audio lifecycle
  useEffect(() => {
    if (exhibit.audioUrl) {
      const audio = new Audio(exhibit.audioUrl);
      audio.volume = volume;
      audio.loop = false;
      audioRef.current = audio;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.pause();
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audioRef.current = null;
      };
    }
  }, [exhibit.audioUrl]);

  // Handle active state changes (navigating away)
  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    if (isActive && audioRef.current) {
      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.log("Auto-play blocked by browser:", err);
          });
          setIsPlaying(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Sync volume state with audio object
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Playback blocked by browser auto-play policy");
      });
    }
  };

  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

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

    // El spotlight del texto de la pared ahora es global y manejado por GlobalTextSpotlight

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
    <group 
      onClick={(e) => { e.stopPropagation(); if (onClick) onClick(); }}
      onPointerOver={() => { if (!isActive) { document.body.style.cursor = 'pointer'; setHovered(true); } }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
    >
      {/* BASE DORADA HUNDIDA (Recessed Golden Plinth) */}
      <mesh position={[exhibit.pos[0], exhibit.pos[1] + 0.075, exhibit.pos[2]]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.15, 1.0]} />
        <meshStandardMaterial map={metalTex} color="#c5a059" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* BLOQUE PRINCIPAL OSCURO GRAFITO (Dark Graphite Block) */}
      <mesh position={[exhibit.pos[0], exhibit.pos[1] + 0.95, exhibit.pos[2]]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.6, 1.2]} />
        <meshStandardMaterial color="#2c2e33" metalness={0.2} roughness={0.65} />
      </mesh>

      <group position={exhibit.pos} rotation={[0, exhibit.rotY || 0, 0]}>
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

      {/* 3D HOLOGRAPHIC HTML DISPLAY PANEL */}
      {isActive && exhibit.metadata && (
        <group position={exhibit.pos}>
          {/* 2D Overlay Panel anchored safely to the right of the jersey in 3D space */}
          <group position={exhibit.isCenter ? [exhibit.rotY === Math.PI ? -0.6 : 0.6, 2.3, 0] : (exhibit.isLeft ? [0, 2.3, -0.6] : [0, 2.3, 0.6])}>
            <Html
              center
              pointerEvents="auto"
              zIndexRange={[100, 0]}
            >
              <div style={{ transform: 'translateX(260px)' }}>
                {isMinimized ? (
                  <button 
                    onClick={() => setIsMinimized(false)}
                    style={{
                      background: 'rgba(5, 12, 22, 0.85)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid #00f0ff',
                      color: '#00f0ff',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
                      transform: 'translateX(-260px)', /* center it exactly on the 3D anchor */
                    }}
                  >
                    i
                  </button>
                ) : (
                  <div style={{ position: 'relative' }}>
                    {/* Angled Connecting Line */}
                    <svg style={{ position: 'absolute', left: '-50px', top: '150px', width: '50px', height: '60px', overflow: 'visible', pointerEvents: 'none' }}>
                      <polyline points="0,60 20,20 50,20" fill="none" stroke="#00f0ff" strokeWidth="2" opacity="0.6" />
                      <circle cx="0" cy="60" r="4" fill="#00f0ff" />
                    </svg>
                    
                    <div className="cyber-panel-container" style={{ 
                      width: '450px',
                      height: '620px',
                      background: 'rgba(5, 12, 20, 0.90)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0, 240, 255, 0.7)',
                      borderRadius: '8px',
                      boxShadow: '0 0 25px rgba(0, 240, 255, 0.3), inset 0 0 15px rgba(0, 240, 255, 0.1)',
                      padding: '20px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: '#fff',
                      userSelect: 'none'
                    }}>
                      {/* Embedded Stylesheet for Keyframe Animations and Custom Controls */}
                      <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap');
                        .cyber-panel-container {
                          font-family: 'Montserrat', system-ui, -apple-system, sans-serif !important;
                        }
                        @keyframes ripple {
                          0% { transform: scaleY(0.25); }
                          50% { transform: scaleY(1); }
                          100% { transform: scaleY(0.25); }
                        }
                        .soundwave-bar {
                          width: 3px;
                          height: 20px;
                          background: #00f0ff;
                          margin: 0 2px;
                          border-radius: 2px;
                          transform-origin: bottom;
                          display: inline-block;
                          transform: scaleY(0.25);
                          transition: transform 0.2s;
                        }
                        .soundwave-bar.animating {
                          animation: ripple 1.0s ease-in-out infinite;
                        }
                        .soundwave-bar:nth-child(2) { animation-delay: 0.15s; }
                        .soundwave-bar:nth-child(3) { animation-delay: 0.3s; }
                        .soundwave-bar:nth-child(4) { animation-delay: 0.45s; }
                        .soundwave-bar:nth-child(5) { animation-delay: 0.6s; }

                        .cyber-tab {
                          background: none;
                          border: none;
                          color: rgba(255, 255, 255, 0.5);
                          font-size: 11px;
                          font-family: 'Montserrat', system-ui, sans-serif;
                          font-weight: 600;
                          text-transform: uppercase;
                          padding: 8px 6px;
                          cursor: pointer;
                          transition: all 0.3s;
                          border-bottom: 2px solid transparent;
                          letter-spacing: 0.5px;
                        }
                        .cyber-tab.active {
                          color: #00f0ff;
                          border-bottom: 2px solid #00f0ff;
                          text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
                        }
                        .cyber-tab:hover {
                          color: #ffffff;
                        }

                        .audio-btn {
                          background: rgba(0, 240, 255, 0.08);
                          border: 1px solid rgba(0, 240, 255, 0.4);
                          color: #00f0ff;
                          width: 34px;
                          height: 34px;
                          border-radius: 50%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          cursor: pointer;
                          transition: all 0.2s;
                          box-shadow: 0 0 8px rgba(0, 240, 255, 0.1);
                        }
                        .audio-btn:hover {
                          background: rgba(0, 240, 255, 0.25);
                          border-color: #00f0ff;
                          box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
                          color: #fff;
                        }
                        .audio-btn:active {
                          transform: scale(0.95);
                        }

                        .custom-scroll::-webkit-scrollbar {
                          width: 4px;
                        }
                        .custom-scroll::-webkit-scrollbar-track {
                          background: rgba(255, 255, 255, 0.03);
                        }
                        .custom-scroll::-webkit-scrollbar-thumb {
                          background: rgba(0, 240, 255, 0.3);
                          border-radius: 2px;
                        }
                        .custom-scroll::-webkit-scrollbar-thumb:hover {
                          background: #00f0ff;
                        }

                        .volume-slider {
                          -webkit-appearance: none;
                          width: 85px;
                          height: 4px;
                          background: rgba(255, 255, 255, 0.2);
                          border-radius: 2px;
                          outline: none;
                          transition: background 0.3s;
                        }
                        .volume-slider::-webkit-slider-thumb {
                          -webkit-appearance: none;
                          appearance: none;
                          width: 10px;
                          height: 10px;
                          border-radius: 50%;
                          background: #00f0ff;
                          cursor: pointer;
                          box-shadow: 0 0 6px rgba(0, 240, 255, 0.8);
                          transition: transform 0.1s;
                        }
                        .volume-slider::-webkit-slider-thumb:hover {
                          transform: scale(1.25);
                        }
                      `}</style>

                      {/* Cyber Corner lines */}
                      <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '12px', height: '12px', borderTop: '2px solid #00f0ff', borderLeft: '2px solid #00f0ff', borderTopLeftRadius: '8px' }}></div>
                      <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '12px', height: '12px', borderTop: '2px solid #00f0ff', borderRight: '2px solid #00f0ff', borderTopRightRadius: '8px' }}></div>
                      <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '12px', height: '12px', borderBottom: '2px solid #00f0ff', borderLeft: '2px solid #00f0ff', borderBottomLeftRadius: '8px' }}></div>
                      <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '12px', height: '12px', borderBottom: '2px solid #00f0ff', borderRight: '2px solid #00f0ff', borderBottomRightRadius: '8px' }}></div>

                      {/* Header */}
                      <div style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.25)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '2px', color: '#00f0ff', textShadow: '0 0 8px rgba(0, 240, 255, 0.4)' }}>
                          {exhibit.title}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <button 
                            onClick={() => setIsMinimized(true)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(0, 240, 255, 0.6)',
                              cursor: 'pointer',
                              fontSize: '18px',
                              padding: '0 5px',
                              transition: 'color 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseOver={(e) => e.target.style.color = '#fff'}
                            onMouseOut={(e) => e.target.style.color = 'rgba(0, 240, 255, 0.6)'}
                            title="Minimizar"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {/* Tabs Selector */}
                      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '20px', marginTop: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <button className={`cyber-tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Descripción</button>
                        {exhibit.imageUrl && (
                          <button className={`cyber-tab ${activeTab === 'image' ? 'active' : ''}`} onClick={() => setActiveTab('image')}>Imagen</button>
                        )}
                      </div>

                      {/* Body Content */}
                      <div 
                        className="custom-scroll" 
                        style={{ flexGrow: 1, minHeight: 0, marginTop: '15px', marginBottom: '15px', overflowY: 'auto', fontSize: '13px', lineHeight: '1.7', color: 'rgba(255,255,255,0.9)', paddingRight: '6px', textAlign: 'left' }}
                        onWheel={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {activeTab === 'description' && (
                          <div dangerouslySetInnerHTML={{ __html: exhibit.metadata.description }} />
                        )}
                        {activeTab === 'image' && exhibit.imageUrl && (
                          <div style={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(0,240,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={exhibit.imageUrl} alt={exhibit.title} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', objectFit: 'contain' }} />
                          </div>
                        )}
                      </div>

                      {/* Audio Controls Footer */}
                      <div style={{
                        background: 'rgba(0, 240, 255, 0.05)',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button className="audio-btn" onClick={togglePlay} title="Play/Pause">
                            {isPlaying ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="4" width="4" height="16" fill="currentColor"/><rect x="6" y="4" width="4" height="16" fill="currentColor"/></svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>
                            )}
                          </button>
                          <button className="audio-btn" onClick={stopAudio} title="Stop">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" fill="currentColor"/></svg>
                          </button>
                        </div>

                        {/* Volume Slider Control */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(0, 240, 255, 0.8)' }}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="volume-slider"
                          />
                        </div>

                        {/* Rippling Soundwave Visualizer */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', height: '20px', width: '35px', justifyContent: 'center' }}>
                          <span className={`soundwave-bar ${isPlaying ? 'animating' : ''}`}></span>
                          <span className={`soundwave-bar ${isPlaying ? 'animating' : ''}`}></span>
                          <span className={`soundwave-bar ${isPlaying ? 'animating' : ''}`}></span>
                          <span className={`soundwave-bar ${isPlaying ? 'animating' : ''}`}></span>
                          <span className={`soundwave-bar ${isPlaying ? 'animating' : ''}`}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Html>
          </group>
        </group>
      )}



      {/* BAÑADOR DE PARED DORADO ELIMINADO PARA MANTENER LUZ NEUTRA EN VIP */}

      {/* GRUPO CON ROTACIÓN Y PIVOTE DEL CIELORRASO UNIFICADOS */}
      {(() => {
        const tiltX = 0; // Apunta directo hacia abajo
        const tiltZ = 0; // Removido tiltZ para evitar derrame lateral
        return (
          <group position={ceilingLightPos} rotation={[tiltX, 0, tiltZ]}>
            {/* OCULTAR FÍSICA PARA VIP (Premium) */}
            {exhibit.type !== 'premium' && (
              <>
                <CeilingFixture active={isActive} />
                <VolumetricLightBeam active={isActive} ceilingHeight={actualCeilingHeight} />
              </>
            )}

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

const CameraRig = ({ activeIndex, currentWaypoint, started }) => {
  const { camera } = useThree();
  const controls = useRef();
  const initialMount = useRef(true);
  const isTransitioningFromLogin = useRef(false);
  const cinematicTime = useRef(0);
  const cinematicActive = useRef(false);

  // LOGIC TO HANDLE LOGIN AND CAMERA TRANSITION
  useEffect(() => {
    if (!controls.current) return;
    
    if (!started) {
      // ESTADO LOGIN: Apuntando a la pared de entrada (Z = 1.0) desde Z = -2.0
      camera.position.set(0, 2.2, -2.5);
      controls.current.target.set(0, 2.2, 1.0);
      controls.current.enabled = false;
      controls.current.update();
    } else if (started && initialMount.current) {
      // TRANSICIÓN AL MUSEO: Gira la cámara hacia el pasillo
      controls.current.enabled = false;
      controls.current.enableDamping = false; // MUST BE FALSE during manual cinematic to prevent double-smoothing rubber-banding
      isTransitioningFromLogin.current = true;
      cinematicActive.current = true;
      cinematicTime.current = 0;
      initialMount.current = false;
    }
  }, [started, camera]);

  // LOGIC TO HANDLE WAYPOINTS (Only active when started is true)
  useEffect(() => {
    if (!started || isTransitioningFromLogin.current) return;
    
    if (activeIndex === null) {
      const wp = WAYPOINTS[currentWaypoint];
      
      if (controls.current) controls.current.enabled = false;
      
      let newTargetX, newTargetY, newTargetZ;

      if (!controls.current) {
        // En initialMount calculamos la dirección hacia targetPos y acercamos el target a 0.001
        const dx = wp.targetPos[0] - wp.camPos[0];
        const dy = wp.targetPos[1] - wp.camPos[1];
        const dz = wp.targetPos[2] - wp.camPos[2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist > 0) {
          newTargetX = wp.camPos[0] + (dx / dist) * 0.001;
          newTargetY = wp.camPos[1] + (dy / dist) * 0.001;
          newTargetZ = wp.camPos[2] + (dz / dist) * 0.001;
        } else {
          newTargetX = wp.targetPos[0];
          newTargetY = wp.targetPos[1];
          newTargetZ = wp.targetPos[2];
        }
        
        // Evita el paneo inicial saltando directamente a la posición
        camera.position.set(wp.camPos[0], wp.camPos[1], wp.camPos[2]);
        if (controls.current) {
          controls.current.target.set(newTargetX, newTargetY, newTargetZ);
          controls.current.enabled = true;
          controls.current.update();
        }
        return;
      } else {
        // Al moverse entre puntos o volver de una obra, preservamos hacia dónde mira el usuario
        // obteniendo la dirección actual de la mirada y calculando un target muy cercano (0.001) a la NUEVA posición.
        // Esto crea un efecto "Primera Persona" perfecto donde al arrastrar se orbita sobre su propio eje sin desplazarse.
        const currentDirX = controls.current.target.x - camera.position.x;
        const currentDirY = controls.current.target.y - camera.position.y;
        const currentDirZ = controls.current.target.z - camera.position.z;
        const dist = Math.sqrt(currentDirX*currentDirX + currentDirY*currentDirY + currentDirZ*currentDirZ);
        
        if (dist > 0) {
          newTargetX = wp.camPos[0] + (currentDirX / dist) * 0.001;
          newTargetY = wp.camPos[1] + (currentDirY / dist) * 0.001;
          newTargetZ = wp.camPos[2] + (currentDirZ / dist) * 0.001;
        } else {
          newTargetX = wp.targetPos[0];
          newTargetY = wp.targetPos[1];
          newTargetZ = wp.targetPos[2];
        }
      }
      
      gsap.to(camera.position, {
        x: wp.camPos[0],
        y: wp.camPos[1],
        z: wp.camPos[2],
        duration: 3.0,
        ease: 'power3.inOut'
      });

      if (controls.current) {
        gsap.to(controls.current.target, {
          x: newTargetX,
          y: newTargetY,
          z: newTargetZ,
          duration: 3.0,
          ease: 'power3.inOut',
          onComplete: () => {
            if (controls.current) {
              controls.current.update();
              controls.current.enabled = true;
            }
          }
        });
      }
    }
  }, [activeIndex, currentWaypoint, camera, started]);

  useEffect(() => {
    if (activeIndex === 'painting') {
      if (controls.current) controls.current.enabled = false;
      
      gsap.to(camera.position, {
        x: 0,
        y: 2.3,
        z: -18.0,
        duration: 3.0,
        ease: 'power3.inOut'
      });

      if (controls.current) {
        gsap.to(controls.current.target, {
          x: 0,
          y: 2.3,
          z: -21.91,
          duration: 3.0,
          ease: 'power3.inOut',
          onComplete: () => {
            if (controls.current) {
              controls.current.update();
              controls.current.enabled = true;
            }
          }
        });
      }
    } else if (activeIndex === 'premium_general') {
      if (controls.current) controls.current.enabled = false;
      
      gsap.to(camera.position, {
        x: 0,
        y: 3.5,
        z: -14.5,
        duration: 3.0,
        ease: 'power3.inOut'
      });

      if (controls.current) {
        gsap.to(controls.current.target, {
          x: 0,
          y: 2.6,
          z: -20.4,
          duration: 3.0,
          ease: 'power3.inOut',
          onComplete: () => {
            if (controls.current) {
              controls.current.update();
              controls.current.enabled = true;
            }
          }
        });
      }
    } else if (activeIndex !== null) {
      const targetExhibit = EXHIBITS[activeIndex];
      
      if (controls.current) controls.current.enabled = false;

      gsap.to(camera.position, {
        x: targetExhibit.camPos[0],
        y: targetExhibit.camPos[1],
        z: targetExhibit.camPos[2],
        duration: 2.5,
        ease: 'power3.inOut'
      });

      if (controls.current) {
        gsap.to(controls.current.target, {
          x: targetExhibit.pos[0],
          y: targetExhibit.isCenter ? 2.2 : 2.35,
          z: targetExhibit.pos[2],
          duration: 2.5,
          ease: 'power3.inOut',
          onComplete: () => {
            if (controls.current) {
              controls.current.update();
              controls.current.enabled = true;
            }
          }
        });
      }
    }
  }, [activeIndex, camera, started]);

  useFrame((state, delta) => {
    // CINEMATIC: Bypass OrbitControls entirely. Drive the camera directly with
    // camera.position + camera.lookAt() so there is ZERO interference from any
    // OrbitControls internal update loop, damping calculation or constraint check.
    if (cinematicActive.current) {
      const safeDelta = Math.min(delta, 0.033);
      cinematicTime.current += safeDelta;
      let t = cinematicTime.current / 2.5;

      if (t >= 1.0) {
        // Cinematic done: hand control back to OrbitControls
        cinematicActive.current = false;
        isTransitioningFromLogin.current = false;
        camera.position.set(0, 2.8, -2.0);
        // Sync OrbitControls to the final position before re-enabling
        controls.current.target.set(0, 2.8, -10.0);
        controls.current.object.position.copy(camera.position);
        controls.current.enabled = true;
        controls.current.enableDamping = true;
        controls.current.update();
        return;
      }

      // Cubic ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Camera position sweeps slightly forward
      const camY = THREE.MathUtils.lerp(2.2, 2.8, ease);
      const camZ = THREE.MathUtils.lerp(-2.5, -2.0, ease);
      camera.position.set(0, camY, camZ);

      // Rotate the lookAt target 180° around the camera
      const angle = THREE.MathUtils.lerp(0, Math.PI, ease);
      const radius = THREE.MathUtils.lerp(3.5, 8.0, ease);
      const lookX = Math.sin(angle) * radius;
      const lookZ = camZ + Math.cos(angle) * radius;

      // Drive camera directly — NO OrbitControls involvement whatsoever
      camera.lookAt(lookX, camY, lookZ);
      return;
    }

    // If a cinematic transition is actively animating the camera and target, 
    // DO NOT recalculate or write back to camera.position. This prevents massive 
    // race conditions which cause micro-stuttering.
    if (isTransitioningFromLogin.current) return;

    let x = camera.position.x;
    let z = camera.position.z;
    let targetX = controls.current ? controls.current.target.x : 0;
    let targetZ = controls.current ? controls.current.target.z : 0;

    const enforceBounds = (cx, cz, isTarget = false) => {
      // Limites Generales
      cx = THREE.MathUtils.clamp(cx, -21.2, 21.2);
      cz = THREE.MathUtils.clamp(cz, -22.5, isTarget ? 2.0 : 0.8);

      const inPortalZ = cz <= -13.0 && cz >= -18.0;

      if (!inPortalZ) {
        // Fuera de los portales, las paredes laterales de la sala principal son sólidas
        if (cx > 5.3 && cx < 6.5) {
          cx = (cx < 5.9) ? 5.3 : 6.5;
        }
        if (cx < -5.3 && cx > -6.5) {
          cx = (cx > -5.9) ? -5.3 : -6.5;
        }
      }

      // Pared trasera de la sala principal (Z = -22.0)
      if (cx > -5.3 && cx < 5.3) {
        cz = Math.max(cz, -21.7);
      } else {
        // Limites frontales y traseros de las salas VIP (Z = -8.0 a -23.0)
        // Las paredes VIP están en Z=-8 y Z=-23.
        if (cx < -5.3 || cx > 5.3) {
          cz = THREE.MathUtils.clamp(cz, -22.7, -8.3);
        }
      }
      return [cx, cz];
    };

    const [newX, newZ] = enforceBounds(x, z, false);
    camera.position.x = newX;
    camera.position.z = newZ;
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 1.0, ROOM_HEIGHT - 0.4);

    if (controls.current) {
      const [ntX, ntZ] = enforceBounds(targetX, targetZ, true);
      controls.current.target.x = ntX;
      controls.current.target.z = ntZ;
      controls.current.target.y = THREE.MathUtils.clamp(controls.current.target.y, 1.0, ROOM_HEIGHT - 0.2);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      target={[0, 2.8, -3]}
      enablePan={false}
      enableZoom={activeIndex !== null}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2}
      minDistance={0.01}
      maxDistance={20.0}
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
        <mesh position={[0, -0.148, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.015, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      <group position={[1.8, ROOM_HEIGHT, -17.2]} rotation={[0.3, 0.25, 0]}>
        <mesh castShadow={false} position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.15, 16]} />
          <meshStandardMaterial color="#111111" metalness={0.0} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.148, 0]}>
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
        <mesh position={[0, -0.148, 0]}>
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
        <mesh position={[0, -0.148, 0]}>
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
        <mesh position={[0, -0.148, 0]}>
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

const VIPLighting = () => {
  return (
    <group>
      {/* LUZ AMBIENTE VIP IZQUIERDA */}
      <pointLight 
        position={[-14.0, ROOM_HEIGHT - 1.0, -15.5]} 
        intensity={5.0} 
        color="#ffffff" 
        decay={1.5} 
        distance={15} 
        castShadow={false}
      />
      {/* LUZ AMBIENTE VIP DERECHA */}
      <pointLight 
        position={[14.0, ROOM_HEIGHT - 1.0, -15.5]} 
        intensity={5.0} 
        color="#ffffff" 
        decay={1.5} 
        distance={15} 
        castShadow={false}
      />
    </group>
  );
};

const BidirectionalSconce = ({ position, hasLight = false, intensityScale = 1.0, bracketOffset = null, bracketArgs = [0.08, 0.08, 0.04] }) => {
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
      <mesh position={bracketOffset || [position[0] < 0 ? -0.04 : 0.04, 0, 0]} castShadow>
        <boxGeometry args={bracketOffset ? bracketArgs : [0.08, 0.08, 0.04]} />
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
      {/* SCONCES PARED IZQUIERDA (SALA PRINCIPAL) */}
      <BidirectionalSconce position={[-5.42, 2.1, -0.75]} hasLight={true} />
      <BidirectionalSconce position={[-5.42, 2.1, -5.25]} hasLight={true} />
      <BidirectionalSconce position={[-5.42, 2.1, -9.75]} hasLight={true} />
      <BidirectionalSconce position={[-5.42, 2.1, -19.75]} hasLight={true} />

      {/* SCONCES PARED DERECHA (SALA PRINCIPAL) */}
      <BidirectionalSconce position={[5.42, 2.1, -0.75]} hasLight={true} />
      <BidirectionalSconce position={[5.42, 2.1, -5.25]} hasLight={true} />
      <BidirectionalSconce position={[5.42, 2.1, -9.75]} hasLight={true} />
      <BidirectionalSconce position={[5.42, 2.1, -19.75]} hasLight={true} />

      {/* SCONCES SALA LATERAL IZQUIERDA VIP */}
      <BidirectionalSconce position={[-21.42, 2.1, -15.5]} hasLight={true} intensityScale={1.5} />
      <BidirectionalSconce position={[-21.42, 2.1, -11.5]} hasLight={true} />
      <BidirectionalSconce position={[-21.42, 2.1, -19.5]} hasLight={true} />
      {/* Pared interna VIP Izquierda mirando hacia el VIP */}
      <BidirectionalSconce position={[-10.0, 2.1, -22.92]} hasLight={true} bracketOffset={[0, 0, -0.04]} />
      <BidirectionalSconce position={[-17.5, 2.1, -22.92]} hasLight={true} bracketOffset={[0, 0, -0.04]} />
      <BidirectionalSconce position={[-10.0, 2.1, -8.08]} hasLight={true} bracketOffset={[0, 0, 0.04]} />
      <BidirectionalSconce position={[-17.5, 2.1, -8.08]} hasLight={true} bracketOffset={[0, 0, 0.04]} />

      {/* SCONCES SALA LATERAL DERECHA VIP */}
      <BidirectionalSconce position={[21.42, 2.1, -15.5]} hasLight={true} intensityScale={1.5} />
      <BidirectionalSconce position={[21.42, 2.1, -11.5]} hasLight={true} />
      <BidirectionalSconce position={[21.42, 2.1, -19.5]} hasLight={true} />
      {/* Sconces removidos de las paredes frontales y traseras para no interferir con los murales */}

      {/* SCONCES PARED TRASERA SALA PRINCIPAL (Z = -22.0) */}
      <BidirectionalSconce position={[-4.2, 2.1, -21.92]} hasLight={true} bracketOffset={[0, 0, -0.04]} bracketArgs={[0.08, 0.08, 0.08]} />
      <BidirectionalSconce position={[4.2, 2.1, -21.92]} hasLight={true} bracketOffset={[0, 0, -0.04]} bracketArgs={[0.08, 0.08, 0.08]} />

      {/* SCONCES PARED DE ENTRADA (Z = 1.0) */}
      <BidirectionalSconce position={[-3.8, 2.1, 0.92]} hasLight={true} bracketOffset={[0, 0, 0.04]} bracketArgs={[0.08, 0.08, 0.08]} />
      <BidirectionalSconce position={[3.8, 2.1, 0.92]} hasLight={true} bracketOffset={[0, 0, 0.04]} bracketArgs={[0.08, 0.08, 0.08]} />
      
      {/* SCONCES LOGIN (PARA LA PANTALLA DE INICIO) */}
      <BidirectionalSconce position={[-1.5, 2.1, 0.92]} hasLight={true} bracketOffset={[0, 0, 0.04]} bracketArgs={[0.08, 0.08, 0.08]} />
      <BidirectionalSconce position={[1.5, 2.1, 0.92]} hasLight={true} bracketOffset={[0, 0, 0.04]} bracketArgs={[0.08, 0.08, 0.08]} />
    </group>
  );
};

const GlobalTextSpotlight = ({ activeIndex }) => {
  const spotRef = useRef();
  const targetRef = useRef();

  useFrame(() => {
    if (spotRef.current) {
      const exhibit = activeIndex !== null && typeof activeIndex === 'number' ? EXHIBITS.find(e => e.id === activeIndex) : null;
      const targetIntensity = exhibit && exhibit.type === 'regular' ? 80.0 : 0.0;
      spotRef.current.intensity = THREE.MathUtils.lerp(spotRef.current.intensity, targetIntensity, 0.15);
      
      if (exhibit && exhibit.type === 'regular' && targetRef.current) {
         spotRef.current.position.set(exhibit.textPos[0], exhibit.textPos[1] - 0.15, exhibit.textPos[2]);
         targetRef.current.position.set(exhibit.textPos[0], exhibit.textPos[1] - 5, exhibit.textPos[2]);
      }
    }
  });

  return (
    <>
      <object3D ref={targetRef} position={[0, -5, 0]} />
      <spotLight
        ref={spotRef}
        position={[0, -0.15, 0]}
        target={targetRef.current || undefined}
        angle={0.45}
        penumbra={0.8}
        intensity={0}
        color="#ffffff"
        decay={1.1}
        distance={8}
        castShadow={false}
      />
    </>
  );
};

const ReadyTrigger = ({ onReady }) => {
  const { gl, scene, camera } = useThree();
  const frames = useRef(0);
  const called = useRef(false);
  
  useFrame(() => {
    if (called.current) return;
    frames.current++;
    
    if (frames.current === 1) {
      // While the screen is 100% black during loading, pre-render the full scene
      // (including ALL shadow maps) from every camera angle that will be seen 
      // during the 180-degree cinematic pan. This is the ONLY way to prevent 
      // Three.js from computing shadow maps on-demand mid-animation (which causes stutters).
      const originalPos = camera.position.clone();
      const originalRot = camera.rotation.clone();
      const originalQuat = camera.quaternion.clone();
      
      // Pre-render from 6 key positions along the cinematic arc
      // These cover 0° (entrance), 30°, 60°, 90°, 120°, 150°, 180° (museum interior)
      const preWarmAngles = [0, Math.PI * 0.16, Math.PI * 0.33, Math.PI * 0.5, Math.PI * 0.66, Math.PI * 0.83, Math.PI];
      
      preWarmAngles.forEach(angle => {
        const ease = angle / Math.PI; // 0 to 1
        const camZ = -2.5 + ease * 0.5; // lerp -2.5 to -2.0
        const radius = 3.5 + ease * 4.5; // lerp 3.5 to 8.0
        const lookX = Math.sin(angle) * radius;
        const lookZ = camZ + Math.cos(angle) * radius;
        
        camera.position.set(0, 2.5, camZ);
        camera.lookAt(lookX, 2.5, lookZ);
        
        // Full render pass - computes ALL shadow maps for this frustum
        gl.render(scene, camera);
      });
      
      // Restore camera to login position
      camera.position.copy(originalPos);
      camera.quaternion.copy(originalQuat);
      camera.rotation.copy(originalRot);
    }

    if (frames.current >= 3) {
      called.current = true;
      onReady();
    }
  });
  return null;
};


// --- MEMOIZED COMPONENTS FOR PERFORMANCE ---
// React.memo prevents these extremely heavy 3D components from re-rendering 
// when 'started' state changes in <App>, which previously caused a massive CPU spike 
// and frame drops exactly when the cinematic camera transition started.

const MemoMuseumRoom = React.memo(MuseumRoom);
const MemoGlobalTextSpotlight = React.memo(GlobalTextSpotlight);
const MemoTextLighting = React.memo(TextLighting);
const MemoCorridorLighting = React.memo(CorridorLighting);
const MemoVIPLighting = React.memo(VIPLighting);
const MemoWallSconces = React.memo(WallSconces);

const MemoPedestalStation = React.memo(PedestalStation, (prev, next) => {
  return prev.isActive === next.isActive && prev.isPremiumEnabled === next.isPremiumEnabled;
});

const MemoWaypointNode = React.memo(WaypointNode, (prev, next) => {
  return prev.isActive === next.isActive;
});

export default function App() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [started, setStarted] = useState(false);
  const [cinematicReady, setCinematicReady] = useState(false); // True only after HTML overlay is fully removed from GPU
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isPremiumEnabled, setIsPremiumEnabled] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(true);

  // RESET DEL POPUP CADA VEZ QUE SE ENTRA A LA ZONA PREMIUM
  useEffect(() => {
    if (activeIndex === 'premium_general') {
      setShowPremiumModal(true);
    }
  }, [activeIndex]);

  // Actualiza el waypoint actual al más cercano cuando se inspecciona una obra
  // para que al hacer clic en "VOLVER A LA SALA" el usuario quede cerca de la obra
  useEffect(() => {
    if (activeIndex !== null && typeof activeIndex === 'number' && EXHIBITS[activeIndex]) {
      const exhibit = EXHIBITS[activeIndex];
      let closestWp = currentWaypoint;
      let minDistance = Infinity;
      
      WAYPOINTS.forEach(wp => {
        // Validación para no saltar de sala principal a salas VIP
        const exhibitInMain = Math.abs(exhibit.camPos[0]) < 6.5;
        const wpInMain = Math.abs(wp.pos[0]) < 6.5;
        
        if (exhibitInMain !== wpInMain) return; // Si uno es principal y el otro VIP, ignorar
        if (!exhibitInMain && !wpInMain && Math.sign(exhibit.camPos[0]) !== Math.sign(wp.pos[0])) return; // No saltar entre VIP izq y VIP der

        const dist = Math.hypot(wp.pos[0] - exhibit.camPos[0], wp.pos[2] - exhibit.camPos[2]);
        if (dist < minDistance) {
          minDistance = dist;
          closestWp = wp.id;
        }
      });
      
      setCurrentWaypoint(closestWp);
    }
  }, [activeIndex, currentWaypoint]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', margin: 0, overflow: 'hidden', position: 'relative' }}>
      
      <LandingLogin
        started={started}
        isSceneReady={isSceneReady}
        onLogin={() => setStarted(true)}
        onReadyForCinematic={() => setCinematicReady(true)}
      />

      <div id="canvas-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          {/* CONTROL DE NAVEGACIÓN LIBRE */}
          {activeIndex !== null && (
            <div style={{ position: 'absolute', bottom: 60, right: 60, zIndex: 10, display: 'flex', gap: '30px', fontFamily: 'sans-serif', letterSpacing: '2px', fontSize: '11px', alignItems: 'center' }}>
              <button
                onClick={() => setActiveIndex(null)}
                style={{
                  background: 'rgba(200, 168, 83, 0.1)',
                  border: '1px solid rgba(200, 168, 83, 0.3)',
                  borderRadius: '4px',
                  color: '#C8A853',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(200, 168, 83, 0.25)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(200, 168, 83, 0.1)'; }}
              >
                Volver a la sala
              </button>
            </div>
          )}

          <Canvas 
            shadows 
            camera={{ position: [0, 2.2, 0.5], fov: 65 }} 
            gl={{ toneMappingExposure: 1.15, antialias: true }}
          >
            <Suspense fallback={null}>
              <color attach="background" args={['#050505']} />
              <ReadyTrigger onReady={() => setIsSceneReady(true)} />

              {/* LUZ GENERAL MEJORADA */}
              <ambientLight intensity={0.15} />
              <Environment preset="studio" environmentIntensity={0.10} />

              <MemoMuseumRoom setActiveIndex={setActiveIndex} />

              <MemoGlobalTextSpotlight activeIndex={activeIndex} />

              {EXHIBITS.map((ex, i) => (
                <MemoPedestalStation
                  key={ex.id}
                  exhibit={ex}
                  isActive={i === activeIndex}
                  isPremiumEnabled={isPremiumEnabled}
                  onClick={() => setActiveIndex(i)}
                />
              ))}

              {WAYPOINTS.map(wp => (
                <MemoWaypointNode 
                  key={wp.id} 
                  waypoint={wp} 
                  isActive={currentWaypoint === wp.id && activeIndex === null} 
                  onClick={() => {
                    setCurrentWaypoint(wp.id);
                    setActiveIndex(null);
                  }} 
                />
              ))}

              <MemoTextLighting />
              <MemoCorridorLighting />
              <MemoVIPLighting />
              <MemoWallSconces activeIndex={activeIndex} />

              <CameraRig activeIndex={activeIndex} currentWaypoint={currentWaypoint} started={cinematicReady} />
            </Suspense>
          </Canvas>
        </div>
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
useTexture.preload('/Concrete019_4K-JPG_Color.jpg');
useTexture.preload('/Concrete019_4K-JPG_NormalGL.jpg');
useTexture.preload('/Concrete019_4K-JPG_Roughness.jpg');
useTexture.preload('/Grass005_4K-JPG_Color.jpg');
useTexture.preload('/Grass005_4K-JPG_NormalGL.jpg');
useTexture.preload('/Grass005_4K-JPG_Roughness.jpg');
useTexture.preload('/Grass005_4K-JPG_AmbientOcclusion.jpg');
useTexture.preload('/Rock035_4K-JPG_Color.jpg');
useTexture.preload('/Rock035_4K-JPG_NormalGL.jpg');
useTexture.preload('/Rock035_4K-JPG_Roughness.jpg');
useTexture.preload('/Rock035_4K-JPG_AmbientOcclusion.jpg');
useTexture.preload('/muralmaradona1.png');
useTexture.preload('/muralmessi1.png');
useTexture.preload('/muralbochini.png');
useTexture.preload('/muralveron.png');