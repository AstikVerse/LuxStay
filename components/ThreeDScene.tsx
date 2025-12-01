import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

// Fix for missing types in React Three Fiber JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      octahedronGeometry: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      torusKnotGeometry: any;
    }
  }
}

// A conceptual abstract room component
const AbstractRoom = ({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * speed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Floor */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[3, 0.1, 3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} /> {/* Slate 800 */}
      </mesh>
      {/* Pillar */}
      <mesh position={[-1.4, 0, -1.4]}>
        <boxGeometry args={[0.2, 2, 0.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {/* Furniture Abstract - Bed */}
      <mesh position={[0.5, -0.8, 0]}>
        <boxGeometry args={[1.5, 0.3, 2]} />
        <meshStandardMaterial color="#cbd5e1" /> {/* Slate 300 */}
      </mesh>
      {/* Floating Gem */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[0, 1.5, 0]}>
            <octahedronGeometry args={[0.3]} />
            <meshStandardMaterial color={color} wireframe />
        </mesh>
      </Float>
    </group>
  );
};

export const ThreeDScene: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-slate-950">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#fef3c7" /> {/* Amber tint */}
        <spotLight position={[-10, 15, 0]} angle={0.3} penumbra={1} intensity={2} color="#f59e0b" /> {/* Amber 500 */}
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <AbstractRoom position={[-2.5, 0, -1]} color="#f59e0b" speed={0.5} /> {/* Amber 500 */}
        <AbstractRoom position={[2.5, 0, -2]} color="#0ea5e9" speed={0.8} /> {/* Sky 500 */}
        
        {/* Central Hero Object */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh position={[0, 0, 0]}>
                <torusKnotGeometry args={[0.8, 0.15, 128, 16]} />
                <meshStandardMaterial 
                    color="#b45309" 
                    metalness={0.9} 
                    roughness={0.1} 
                    emissive="#d97706"
                    emissiveIntensity={0.4}
                />
            </mesh>
        </Float>
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
      </Canvas>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />
    </div>
  );
};