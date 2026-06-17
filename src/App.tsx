/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Machine } from './components/Machine';
import { Prizes } from './components/Prizes';
import { Claw } from './components/Claw';
import { ControlPanel } from './components/ControlPanel';
import { OrbitControls, Environment } from '@react-three/drei';
import { useGameStore } from './store';
import { useEffect, Suspense } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export default function App() {
  const insertCoin = useGameStore(state => state.insertCoin);
  const playGame = useGameStore(state => state.playGame);
  const credits = useGameStore(state => state.credits);
  const tickTime = useGameStore(state => state.tickTime);

  useEffect(() => {
    const interval = setInterval(() => {
      tickTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTime]);

  return (
    <div className="w-full h-screen bg-[#020510] relative overflow-hidden font-sans">
      <Canvas shadows camera={{ position: [0, 6.5, 13], fov: 55, near: 0.1, far: 100 }}>
        <color attach="background" args={['#02040a']} />
        <fog attach="fog" args={['#02040a', 10, 30]} />
        
        {/* Lights */}
        <ambientLight intensity={1.5} />
        {/* Main top spotlight (blue/cyan) */}
        <spotLight 
          position={[0, 15, 0]} 
          angle={0.6} 
          penumbra={0.8} 
          intensity={8} 
          color="#34EDF3" 
          castShadow 
          shadow-bias={-0.0001}
        />
        {/* Side neon fill lights */}
        <pointLight position={[-8, 8, 2]} intensity={12} color="#9201CB" distance={20} />
        <pointLight position={[8, 8, 2]} intensity={12} color="#F715AB" distance={20} />
        <pointLight position={[0, 2, 8]} intensity={5} color="#0313A6" distance={10} />

        <OrbitControls target={[0, 4, 0]} maxPolarAngle={Math.PI / 2 + 0.1} minDistance={5} maxDistance={20} />

        <Suspense fallback={null}>
          <Environment preset="city" />
          <Physics gravity={[0, -9.81, 0]}>
            <Machine />
            <Prizes />
          </Physics>
          
          <Claw />
          <ControlPanel />

          <EffectComposer>
            <Bloom luminanceThreshold={0.5} mipmapBlur intensity={2} radius={0.6} />
            <Vignette eskil={false} offset={0.1} darkness={0.8} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* HTML Overlay for interactions that are hard in 3D */}
      <div className="absolute top-4 left-4 text-white text-xs opacity-50 z-10 pointer-events-none">
        <p>AWSD to Move. SPACE to drop.</p>
      </div>
      <div className="absolute top-4 right-4 flex gap-4 z-10">
        <div className="text-cyan-400 font-mono text-xl border border-cyan-400 px-4 py-2 bg-black/50">
          CREDITS: {credits}
        </div>
        <button 
          onClick={() => {
            insertCoin();
            playGame();
          }}
          className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 font-bold tracking-widest shadow-[0_0_15px_rgba(247,21,171,0.5)] transition-all cursor-pointer pointer-events-auto"
        >
          INSERT COIN
        </button>
      </div>
    </div>
  );
}


