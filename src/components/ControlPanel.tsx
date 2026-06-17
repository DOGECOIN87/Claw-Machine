import { Text } from '@react-three/drei';
import { useGameStore } from '../store';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ControlPanel() {
  const credits = useGameStore(state => state.credits);
  const time = useGameStore(state => state.time);
  const setClawState = useGameStore(state => state.setClawState);
  const clawState = useGameStore(state => state.clawState);
  
  const buttonRef = useRef<THREE.Mesh>(null);
  const joystickRef = useRef<THREE.Group>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key as keyof typeof keys.current] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key as keyof typeof keys.current] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleCatch = () => {
    if (clawState === 'IDLE') {
      setClawState('DROPPING');
    }
  };

  useFrame((state, delta) => {
    if (buttonRef.current) {
      // Simple button press animation
      const targetY = clawState === 'DROPPING' ? -0.1 : 0;
      buttonRef.current.position.y = THREE.MathUtils.lerp(buttonRef.current.position.y, targetY, 0.2);
    }
    if (joystickRef.current) {
      let targetRotX = 0;
      let targetRotZ = 0;
      
      if (clawState === 'IDLE') {
        if (keys.current.w) targetRotX = -0.5;
        if (keys.current.s) targetRotX = 0.5;
        if (keys.current.a) targetRotZ = 0.5;
        if (keys.current.d) targetRotZ = -0.5;
      }
      
      joystickRef.current.rotation.x = THREE.MathUtils.lerp(joystickRef.current.rotation.x, targetRotX, delta * 10);
      joystickRef.current.rotation.z = THREE.MathUtils.lerp(joystickRef.current.rotation.z, targetRotZ, delta * 10);
    }
  });

  return (
    <group position={[0, 2, 7]} rotation={[-Math.PI / 6, 0, 0]}>
      {/* Panel Base */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[18, 1, 6]} />
        <meshStandardMaterial color="#0b001a" metalness={0.9} roughness={0.3} />
      </mesh>
      
      {/* Panel Top Surface (textured purple) */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[17.5, 5.5]} />
        <meshStandardMaterial color="#3a0058" roughness={0.8} />
      </mesh>

      {/* Joystick */}
      <group position={[-5, 0, 0]} ref={joystickRef}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.2, 0.4, 1.2]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshPhysicalMaterial color="#9201CB" roughness={0.1} clearcoat={1} />
        </mesh>
      </group>

      {/* Digital Display Section */}
      <group position={[0, 0, 0]}>
        {/* Label above display */}
        <Text
          position={[-0.8, 0.02, -1.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.3}
          color="#aaa"
        >
          CREDITS
        </Text>
        <Text
          position={[0.8, 0.02, -1.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.3}
          color="#aaa"
        >
          TIME
        </Text>

        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[3.5, 0.3, 1.8]} />
          <meshStandardMaterial color="#000" />
          
          <Text
            position={[0, 0.16, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={1.2}
            color="#34EDF3"
          >
            {time > 0 ? time.toString().padStart(2, '0') : credits.toString().padStart(2, '0')}
          </Text>
          {/* Subtle display glow */}
          <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <planeGeometry args={[3, 1.5]} />
             <meshStandardMaterial color="#34EDF3" transparent opacity={0.1} emissive="#34EDF3" emissiveIntensity={0.2} />
          </mesh>
        </mesh>
      </group>

      {/* CATCH Button */}
      <group position={[5, 0, 0]} onClick={handleCatch} onPointerEnter={() => document.body.style.cursor = 'pointer'} onPointerLeave={() => document.body.style.cursor = 'default'}>
        {/* Button Base Ring */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.8, 1.9, 0.4, 32]} />
          <meshStandardMaterial color="#111" metalness={0.8} />
        </mesh>
        {/* Pressable Part */}
        <mesh ref={buttonRef} position={[0, 0.25, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.4, 32]} />
          <meshPhysicalMaterial 
            color="#F715AB" 
            emissive="#F715AB" 
            emissiveIntensity={1}
            roughness={0.2}
            transmission={0.5}
            thickness={1}
          />
          <Text
            position={[0, 0.21, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.5}
            color="#fff"
            fontWeight="bold"
          >
            CATCH
          </Text>
        </mesh>
      </group>
    </group>
  );
}

