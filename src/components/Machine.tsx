import { useFrame } from '@react-three/fiber';
import { useBox, usePlane } from '@react-three/cannon';
import { useGameStore } from '../store';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

const Wall = ({ position, rotation, args }: any) => {
  useBox(() => ({ type: 'Static', position, rotation, args }));
  return null; // Invisible physics walls
};

const PurpleBalls = () => {
  const count = 3000;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 19;
        const y = Math.random() * 1.5;
        const z = (Math.random() - 0.5) * 19;
        dummy.position.set(x, y, z);
        const scale = 0.8 + Math.random() * 0.4;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]} castShadow receiveShadow>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshPhysicalMaterial 
        color="#9201CB" 
        emissive="#3a0058"
        roughness={0.1}
        transmission={0.8}
        thickness={0.5}
        clearcoat={1}
      />
    </instancedMesh>
  );
};

export function Machine() {
  // Floor
  const [floorRef] = usePlane(() => ({
    type: 'Static',
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 1.5, 0], // Raised to match ball bed height
  }));

  return (
    <group>
      {/* Physics Floor */}
      <mesh ref={floorRef as any} visible={false}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial />
      </mesh>
      
      {/* Visual Ball Bed */}
      <group position={[0, 0, 0]}>
         <mesh position={[0, 0.5, 0]} rotation={[-Math.PI/2, 0, 0]}>
           <planeGeometry args={[20, 20]} />
           <meshStandardMaterial color="#070F34" roughness={0.9} />
         </mesh>
         <PurpleBalls />
      </group>

      {/* Walls */}
      <Wall position={[0, 5, -10]} args={[20, 20, 1]} /> {/* Back */}
      <Wall position={[0, 5, 10]} args={[20, 20, 1]} /> {/* Front */}
      <Wall position={[-10, 5, 0]} args={[1, 20, 20]} /> {/* Left */}
      <Wall position={[10, 5, 0]} args={[1, 20, 20]} /> {/* Right */}

      {/* Decorative Cabinet elements */}
      {/* Back Mirror / neon */}
      <mesh position={[0, 5, -9.5]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#0313A6" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Simplex Sign */}
      <group position={[6, 8, -9]} rotation={[0, 0, 0.1]}>
        <Text
          font="/fonts/Digital.ttf" // Fallback but good enough
          fontSize={1.5}
          color="#F715AB"
          anchorX="center"
          anchorY="middle"
        >
          Simplex
        </Text>
        {/* Glow behind text */}
        <mesh position={[0, 0, -0.1]}>
           <planeGeometry args={[6, 2]} />
           <meshBasicMaterial color="#F715AB" transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Glass Front and Sides */}
      <mesh position={[0, 5, 9.5]}>
        <boxGeometry args={[20, 12, 0.1]} />
        <meshPhysicalMaterial 
          color="#fff" 
          transparent 
          opacity={0.1} 
          roughness={0} 
          transmission={0.9} 
          thickness={0.5} 
        />
      </mesh>
      <mesh position={[-9.5, 5, 0]}>
        <boxGeometry args={[0.1, 12, 20]} />
        <meshPhysicalMaterial color="#fff" transparent opacity={0.1} roughness={0} transmission={0.9} thickness={0.5} />
      </mesh>
      <mesh position={[9.5, 5, 0]}>
        <boxGeometry args={[0.1, 12, 20]} />
        <meshPhysicalMaterial color="#fff" transparent opacity={0.1} roughness={0} transmission={0.9} thickness={0.5} />
      </mesh>

      {/* LED Strips on edges */}
      <mesh position={[-9.6, 5, 9.6]}>
        <cylinderGeometry args={[0.1, 0.1, 12]} />
        <meshStandardMaterial color="#9201CB" emissive="#9201CB" emissiveIntensity={2} />
      </mesh>
      <mesh position={[9.6, 5, 9.6]}>
        <cylinderGeometry args={[0.1, 0.1, 12]} />
        <meshStandardMaterial color="#9201CB" emissive="#9201CB" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

