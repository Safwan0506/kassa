import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function RotatingShape({
  geometry,
  color,
  wireframe = true,
  speed = 0.2,
}: {
  geometry: 'box' | 'octahedron' | 'torus' | 'icosahedron';
  color: string;
  wireframe?: boolean;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed;
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ref}>
        {geometry === 'box' && <boxGeometry args={[2.5, 2.5, 2.5]} />}
        {geometry === 'octahedron' && <octahedronGeometry args={[1.8]} />}
        {geometry === 'torus' && <torusGeometry args={[1.5, 0.4, 16, 32]} />}
        {geometry === 'icosahedron' && <icosahedronGeometry args={[1.8]} />}
        <meshStandardMaterial
          color={color}
          transparent
          opacity={wireframe ? 0.2 : 0.3}
          wireframe={wireframe}
        />
      </mesh>
    </Float>
  );
}

function GridParticles({ color, count = 80 }: { color: string; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.015;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

const ACT_CONFIG = {
  stock: { geometry: 'box' as const, color: '#12614F', speed: 0.15 },
  caisse: { geometry: 'octahedron' as const, color: '#B9791F', speed: 0.2 },
  facture: { geometry: 'torus' as const, color: '#2E7D4F', speed: 0.18 },
  vision: { geometry: 'icosahedron' as const, color: '#12614F', speed: 0.12 },
};

export default function ActScene({ act }: { act: 'stock' | 'caisse' | 'facture' | 'vision' }) {
  const config = ACT_CONFIG[act];

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 4]} intensity={0.5} />
      <RotatingShape
        geometry={config.geometry}
        color={config.color}
        speed={config.speed}
      />
      <GridParticles color={config.color} />
    </Canvas>
  );
}
