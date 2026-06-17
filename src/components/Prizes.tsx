import { useBox } from '@react-three/cannon';
import { useGameStore, transientGameState } from '../store';
import { useRef, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Prize({ position, id }: { position: [number, number, number], id: string }) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [2, 3, 0.5], // Gameboy shape
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
  }));

  const grabbedPrizeId = useGameStore(state => state.grabbedPrizeId);

  useEffect(() => {
    transientGameState.prizePositions[id] = position;
    const unsub = api.position.subscribe((p) => {
      transientGameState.prizePositions[id] = p as [number, number, number];
    });
    return () => unsub();
  }, [id, api, position]);

  useFrame(() => {
    if (grabbedPrizeId === id) {
      // Follow claw if grabbed
      const clawPos = transientGameState.clawPosition;
      api.position.set(clawPos[0], clawPos[1] - 1.5, clawPos[2]);
      api.velocity.set(0, 0, 0); // nullify physics while holding
      api.angularVelocity.set(0, 0, 0);
      api.rotation.set(0, 0, 0);
    }
  });

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={[2, 3, 0.5]} />
      <meshStandardMaterial color="#0A0A1A" roughness={0.6} metalness={0.4} />
      
      {/* Screen Outline */}
      <mesh position={[0, 0.5, 0.26]}>
        <planeGeometry args={[1.5, 1.3]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      {/* Screen Glowing Area */}
      <mesh position={[0, 0.5, 0.27]}>
        <planeGeometry args={[1, 0.8]} />
        <meshStandardMaterial color="#000" emissive="#34EDF3" emissiveIntensity={0.6} />
        <Text
          position={[0, 0.1, 0.01]}
          fontSize={0.25}
          color="#34EDF3"
          anchorX="center"
          anchorY="middle"
        >
           {':U'}
        </Text>
        <Text
          position={[0, -0.2, 0.01]}
          fontSize={0.15}
          color="#34EDF3"
          anchorX="center"
          anchorY="middle"
        >
          GOR BOY.
        </Text>
      </mesh>
      
      {/* Buttons */}
      {/* D-Pad */}
      <group position={[-0.5, -0.6, 0.26]}>
         <mesh>
            <boxGeometry args={[0.4, 0.12, 0.1]} />
            <meshStandardMaterial color="#222" />
         </mesh>
         <mesh>
            <boxGeometry args={[0.12, 0.4, 0.1]} />
            <meshStandardMaterial color="#222" />
         </mesh>
      </group>
      
      {/* Action Buttons */}
      <mesh position={[0.6, -0.4, 0.26]} rotation={[0, 0, 0.2]}>
         <cylinderGeometry args={[0.15, 0.15, 0.1]} />
         <meshStandardMaterial color="#F715AB" emissive="#F715AB" emissiveIntensity={0.2}/>
      </mesh>
      <mesh position={[0.3, -0.6, 0.26]} rotation={[0, 0, 0.2]}>
         <cylinderGeometry args={[0.15, 0.15, 0.1]} />
         <meshStandardMaterial color="#F715AB" emissive="#F715AB" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Select/Start */}
      <mesh position={[-0.1, -1.1, 0.26]} rotation={[0, 0, 0.3]}>
         <boxGeometry args={[0.25, 0.08, 0.1]} />
         <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.3, -1.1, 0.26]} rotation={[0, 0, 0.3]}>
         <boxGeometry args={[0.25, 0.08, 0.1]} />
         <meshStandardMaterial color="#222" />
      </mesh>
      {/* "select" text */}
      <Text position={[-0.1, -1.25, 0.26]} fontSize={0.08} color="#aaa">SELECT</Text>
      <Text position={[0.3, -1.25, 0.26]} fontSize={0.08} color="#aaa">START</Text>
    </mesh>
  );
}

export function Prizes() {
  const prizes = Array.from({ length: 40 }).map((_, i) => ({
    id: `prize-${i}`,
    position: [
      (Math.random() - 0.5) * 16,
      3 + Math.random() * 8, // raised drop height
      (Math.random() - 0.5) * 16
    ] as [number, number, number],
  }));

  return (
    <group>
      {prizes.map((p) => (
        <Prize key={p.id} position={p.position} id={p.id} />
      ))}
    </group>
  );
}

