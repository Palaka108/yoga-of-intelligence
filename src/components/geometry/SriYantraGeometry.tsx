'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function createTriangleGeometry(
  cx: number,
  cy: number,
  size: number,
  inverted: boolean
): THREE.BufferGeometry {
  const h = size * Math.sqrt(3) / 2;
  const vertices = inverted
    ? new Float32Array([cx, cy - h * 0.66, 0, cx - size / 2, cy + h * 0.33, 0, cx + size / 2, cy + h * 0.33, 0])
    : new Float32Array([cx, cy + h * 0.66, 0, cx - size / 2, cy - h * 0.33, 0, cx + size / 2, cy - h * 0.33, 0]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  return geometry;
}

function SriYantraTriangles({ color, opacity }: { color: string; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const triangles = useMemo(() => {
    const tris: { size: number; inverted: boolean; offset: number }[] = [];
    // Upward triangles (Shiva — masculine)
    for (let i = 0; i < 4; i++) {
      tris.push({ size: 2.8 - i * 0.55, inverted: false, offset: i * 0.12 });
    }
    // Downward triangles (Shakti — feminine)
    for (let i = 0; i < 5; i++) {
      tris.push({ size: 2.6 - i * 0.45, inverted: true, offset: -i * 0.1 });
    }
    return tris;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {triangles.map((tri, i) => {
        const geo = createTriangleGeometry(0, tri.offset, tri.size, tri.inverted);
        return (
          <lineLoop key={i} geometry={geo}>
            <lineBasicMaterial color={color} transparent opacity={opacity * (1 - i * 0.05)} />
          </lineLoop>
        );
      })}
    </group>
  );
}

function ConcentricCircles({ count, maxRadius, color, opacity }: {
  count: number;
  maxRadius: number;
  color: string;
  opacity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const radius = (maxRadius / count) * (i + 1);
        const segments = 64 + i * 16;
        return (
          <mesh key={i}>
            <ringGeometry args={[radius - 0.008, radius + 0.008, segments]} />
            <meshBasicMaterial color={color} transparent opacity={opacity * (0.3 + (i / count) * 0.7)} />
          </mesh>
        );
      })}
    </group>
  );
}

function PetalRing({ petalCount, radius, petalSize, color, opacity, rotationSpeed }: {
  petalCount: number;
  radius: number;
  petalSize: number;
  color: string;
  opacity: number;
  rotationSpeed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: petalCount }).map((_, i) => {
        const angle = (i / petalCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
            <circleGeometry args={[petalSize, 32, 0, Math.PI]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

function ParticleField({ count }: { count: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 4;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      s[i] = Math.random() * 2 + 0.5;
    }
    return [pos, s];
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.01;
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 2] = Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1) * 0.1;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#c9a84c"
        transparent
        opacity={0.4}
        size={0.02}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function SriYantraGeometry() {
  const mainGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (mainGroupRef.current) {
      mainGroupRef.current.rotation.z = state.clock.elapsedTime * 0.015;
      mainGroupRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.02
      );
    }
  });

  return (
    <group ref={mainGroupRef}>
      {/* Central bindu */}
      <mesh>
        <circleGeometry args={[0.05, 32]} />
        <meshBasicMaterial color="#c9a84c" />
      </mesh>

      {/* Inner glow around bindu */}
      <mesh>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color="#c9a84c" transparent opacity={0.15} />
      </mesh>

      {/* Sri Yantra interlocking triangles */}
      <SriYantraTriangles color="#c9a84c" opacity={0.7} />

      {/* Inner lotus (8 petals) */}
      <PetalRing petalCount={8} radius={1.6} petalSize={0.35} color="#c9a84c" opacity={0.08} rotationSpeed={0.03} />

      {/* Outer lotus (16 petals) */}
      <PetalRing petalCount={16} radius={2.3} petalSize={0.3} color="#7c3aed" opacity={0.06} rotationSpeed={-0.02} />

      {/* Concentric circles */}
      <ConcentricCircles count={3} maxRadius={3.2} color="#c9a84c" opacity={0.25} />

      {/* Outer square gate (Bhupura) */}
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={5}
            array={new Float32Array([
              -3.5, -3.5, 0,
              3.5, -3.5, 0,
              3.5, 3.5, 0,
              -3.5, 3.5, 0,
              -3.5, -3.5, 0,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#c9a84c" transparent opacity={0.15} />
      </lineLoop>

      {/* Particle field */}
      <ParticleField count={200} />
    </group>
  );
}
