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
    let i = 0;
    while (i < count) {
        const x = (Math.random() - 0.5) * 19;
        const y = Math.random() * 1.5;
        const z = (Math.random() - 0.5) * 19;
        
        // Don't spawn balls inside the drop chute area
        if (x < -5 && z > 5) continue;

        dummy.position.set(x, y, z);
        const scale = 0.8 + Math.random() * 0.4;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        i++;
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]} castShadow receiveShadow>
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

      {/* Drop Chute Area */}
      <group position={[-7.5, 0, 7.5]}>
        {/* Chute Visuals */}
        <mesh position={[0, 2.5, -2.5]}>
          <boxGeometry args={[5, 4, 0.1]} />
          <meshPhysicalMaterial color="#fff" transparent opacity={0.3} roughness={0} transmission={0.9} />
        </mesh>
        <mesh position={[2.5, 2.5, 0]}>
          <boxGeometry args={[0.1, 4, 5]} />
          <meshPhysicalMaterial color="#fff" transparent opacity={0.3} roughness={0} transmission={0.9} />
        </mesh>
        
        {/* Glowing Rim around chute top */}
        <mesh position={[0, 4.5, -2.5]}>
          <boxGeometry args={[5, 0.2, 0.2]} />
          <meshStandardMaterial color="#34EDF3" emissive="#34EDF3" emissiveIntensity={2} />
        </mesh>
        <mesh position={[2.5, 4.5, 0]}>
          <boxGeometry args={[0.2, 0.2, 5]} />
          <meshStandardMaterial color="#34EDF3" emissive="#34EDF3" emissiveIntensity={2} />
        </mesh>
        
        {/* Glowing Drop Zone Text on the floor of the chute */}
        <group position={[0, 1.6, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <mesh>
            <planeGeometry args={[4.8, 4.8]} />
            <meshStandardMaterial color="#0b001a" roughness={0.8} />
          </mesh>
          <Text
            position={[0, 0, 0.1]}
            fontSize={0.6}
            color="#34EDF3"
            anchorX="center"
            anchorY="middle"
          >
            DROP
          </Text>
        </group>
      </group>

      {/* Physics walls for the chute so toys stay inside */}
      <Wall position={[-7.5, 2.5, 5]} args={[5, 5, 0.1]} />
      <Wall position={[-5, 2.5, 7.5]} args={[0.1, 5, 5]} />

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

