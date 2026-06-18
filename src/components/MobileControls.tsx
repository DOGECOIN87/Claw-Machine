import { useGameStore } from '../store';
import { useRef, useEffect, useState } from 'react';

export function MobileControls() {
  const setJoystickInput = useGameStore(state => state.setJoystickInput);
  const setClawState = useGameStore(state => state.setClawState);
  const clawState = useGameStore(state => state.clawState);
  
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleUp = () => {
      setIsDragging(false);
      setKnobPos({ x: 0, y: 0 });
      setJoystickInput({ x: 0, y: 0 });
    };
    
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [setJoystickInput]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateJoystick(e.clientX, e.clientY);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDist = rect.width / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    setKnobPos({ x: dx, y: dy });
    setJoystickInput({ x: dx / maxDist, y: dy / maxDist });
  };

  return (
    <>
      <div className="absolute bottom-8 left-8 z-20 touch-none">
        <div 
          ref={joystickBaseRef}
          className="w-32 h-32 rounded-full border-4 border-cyan-500/50 bg-black/30 relative flex items-center justify-center p-0 m-0 backdrop-blur-sm shadow-[0_0_20px_rgba(52,237,243,0.3)]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        >
          <div 
            className="w-16 h-16 rounded-full bg-cyan-400 shadow-[0_0_15px_#34EDF3] absolute"
            style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)`, transition: isDragging ? 'none' : 'transform 0.2s' }}
          />
        </div>
      </div>
      
      <div className="absolute bottom-8 right-8 z-20 touch-none">
         <button 
           className="w-24 h-24 rounded-full bg-pink-600 hover:bg-pink-500 active:bg-pink-700 active:scale-95 shadow-[0_0_25px_#F715AB] border-4 border-pink-400 font-bold text-white text-xl uppercase tracking-wider backdrop-blur-sm transition-all"
           onClick={() => {
             if (clawState === 'IDLE') setClawState('DROPPING');
           }}
           style={{ WebkitTapHighlightColor: 'transparent' }}
         >
           DROP
         </button>
      </div>
    </>
  );
}
