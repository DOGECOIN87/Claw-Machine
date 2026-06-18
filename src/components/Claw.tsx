import { useFrame } from '@react-three/fiber';
import { useGameStore, transientGameState } from '../store';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const MOVEMENT_BOUNDS = { x: 9, z: 9 };
const DROP_SPEED = 5;
const MOVE_SPEED = 5;
const GROUND_Y = 2; // Increased slightly so we don't clip floor
const ROOF_Y = 8;
const GRAB_DISTANCE = 2.5;

export function Claw() {
  const meshRef = useRef<THREE.Group>(null);
  const prong1Ref = useRef<THREE.Mesh>(null);
  const prong2Ref = useRef<THREE.Mesh>(null);
  const prong3Ref = useRef<THREE.Mesh>(null);
  
  const clawState = useGameStore(state => state.clawState);
  const joystickInput = useGameStore(state => state.joystickInput);
  const setClawState = useGameStore(state => state.setClawState);
  const grabPrize = useGameStore(state => state.grabPrize);
  const releasePrize = useGameStore(state => state.releasePrize);
  
  // Track position locally for smooth updates
  const pos = useRef(new THREE.Vector3(0, ROOF_Y, 0));
  const keys = useRef({ w: false, a: false, s: false, d: false });

  // Handle closing animation state
  const prongAngle = useRef(-0.4); // open is -0.4, closed is 0.

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key as keyof typeof keys.current] = true;
      if (key === ' ' && useGameStore.getState().clawState === 'IDLE') {
        setClawState('DROPPING');
      }
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
  }, [setClawState]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (clawState === 'IDLE') {
      // Movement
      if (keys.current.w || joystickInput.y < -0.1) pos.current.z -= MOVE_SPEED * delta;
      if (keys.current.s || joystickInput.y > 0.1) pos.current.z += MOVE_SPEED * delta;
      if (keys.current.a || joystickInput.x < -0.1) pos.current.x -= MOVE_SPEED * delta;
      if (keys.current.d || joystickInput.x > 0.1) pos.current.x += MOVE_SPEED * delta;
      
      // Clamp bounds
      pos.current.x = THREE.MathUtils.clamp(pos.current.x, -MOVEMENT_BOUNDS.x, MOVEMENT_BOUNDS.x);
      pos.current.z = THREE.MathUtils.clamp(pos.current.z, -MOVEMENT_BOUNDS.z, MOVEMENT_BOUNDS.z);
    } 
    else if (clawState === 'DROPPING') {
      pos.current.y -= DROP_SPEED * delta;
      if (pos.current.y <= GROUND_Y) {
        pos.current.y = GROUND_Y;
        setClawState('CLOSING');
        
        // Check for grabs
        let closestId = null;
        let minDistance = GRAB_DISTANCE;
        
        const currentPos = new THREE.Vector3(pos.current.x, pos.current.y, pos.current.z);
        
        Object.entries(transientGameState.prizePositions).forEach(([id, pPos]) => {
          const prizeVector = new THREE.Vector3(pPos[0], pPos[1], pPos[2]);
          // Adjust Y for comparison.
          const adjustedD = new THREE.Vector3(currentPos.x, currentPos.y - 1.5, currentPos.z).distanceTo(prizeVector);
          
          if (adjustedD < minDistance) {
            minDistance = adjustedD;
            closestId = id;
          }
        });
        
        if (closestId) {
           grabPrize(closestId);
        }

        setTimeout(() => setClawState('ASCENDING'), 1000); // 1s to close
      }
    }
    else if (clawState === 'ASCENDING') {
      pos.current.y += DROP_SPEED * delta;
      if (pos.current.y >= ROOF_Y) {
        pos.current.y = ROOF_Y;
        setClawState('RETURNING');
      }
    }
    else if (clawState === 'RETURNING') {
      // Move back to chute
      const target = new THREE.Vector3(-7.5, ROOF_Y, 7.5);
      pos.current.lerp(target, delta * 3);
      if (pos.current.distanceTo(target) < 0.1) {
        setClawState('OPENING');
        setTimeout(() => {
          releasePrize();
          setClawState('IDLE');
        }, 1000);
      }
    }

    // Animate Prongs (0 to -0.4 tilt outward)
    const targetAngle = (clawState === 'CLOSING' || clawState === 'ASCENDING' || clawState === 'RETURNING') ? 0 : -0.4;
    prongAngle.current = THREE.MathUtils.lerp(prongAngle.current, targetAngle, delta * 5);
    
    if (prong1Ref.current && prong2Ref.current && prong3Ref.current) {
        // Rotate around local X axis of each prong base
        prong1Ref.current.rotation.x = prongAngle.current;
        prong2Ref.current.rotation.x = prongAngle.current;
        prong3Ref.current.rotation.x = prongAngle.current;
    }

    meshRef.current.position.copy(pos.current);
    transientGameState.clawPosition = [pos.current.x, pos.current.y, pos.current.z];
  });

  return (
    <group ref={meshRef}>
      {/* Claw Base Head */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
        <meshStandardMaterial color="#fff" metalness={1} roughness={0.2} envMapIntensity={2} />
      </mesh>
      {/* Base Ring connecting prongs */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.4, 0.1, 16, 32]} />
        <meshStandardMaterial color="#fff" metalness={1} roughness={0.2} envMapIntensity={2} />
      </mesh>

      {/* Rope / Cord (goes straight up to ceiling) */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 20, 16]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Prongs */}
      {/* Prong 1 */}
      <group position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
         <group ref={prong1Ref} position={[0, 0, 0.4]}>
            <mesh position={[0, -1, 0]}>
               <boxGeometry args={[0.1, 2, 0.1]} />
               <meshStandardMaterial color="#fff" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0, -2, -0.4]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.1, 1, 0.1]} />
                <meshStandardMaterial color="#fff" metalness={1} roughness={0.2} />
            </mesh>
         </group>
      </group>

      {/* Prong 2 */}
      <group position={[0, 0.4, 0]} rotation={[0, Math.PI * 2 / 3, 0]}>
         <group ref={prong2Ref} position={[0, 0, 0.4]}>
            <mesh position={[0, -1, 0]}>
               <boxGeometry args={[0.1, 2, 0.1]} />
               <meshStandardMaterial color="#fff" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0, -2, -0.4]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.1, 1, 0.1]} />
                <meshStandardMaterial color="#fff" metalness={1} roughness={0.2} />
            </mesh>
         </group>
      </group>

      {/* Prong 3 */}
      <group position={[0, 0.4, 0]} rotation={[0, -Math.PI * 2 / 3, 0]}>
         <group ref={prong3Ref} position={[0, 0, 0.4]}>
            <mesh position={[0, -1, 0]}>
               <boxGeometry args={[0.1, 2, 0.1]} />
               <meshStandardMaterial color="#fff" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0, -2, -0.4]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.1, 1, 0.1]} />
                <meshStandardMaterial color="#fff" metalness={1} roughness={0.2} />
            </mesh>
         </group>
      </group>

    </group>
  );
}

