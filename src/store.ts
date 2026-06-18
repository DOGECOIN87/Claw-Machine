import { create } from 'zustand';

export type ClawState = 'IDLE' | 'MOVING' | 'DROPPING' | 'CLOSING' | 'ASCENDING' | 'RETURNING' | 'OPENING';

// Used for high-frequency updates that we DO NOT want triggering React re-renders!
export const transientGameState = {
  clawPosition: [0, 8, 0] as [number, number, number],
  prizePositions: {} as Record<string, [number, number, number]>
};

interface GameState {
  credits: number;
  time: number;
  clawState: ClawState;
  grabbedPrizeId: string | null;
  joystickInput: { x: number, y: number };
  insertCoin: () => void;
  playGame: () => void;
  setClawState: (state: ClawState) => void;
  setJoystickInput: (input: { x: number, y: number }) => void;
  grabPrize: (id: string) => void;
  releasePrize: () => void;
  tickTime: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  credits: 0,
  time: 0,
  clawState: 'IDLE',
  grabbedPrizeId: null,
  joystickInput: { x: 0, y: 0 } as { x: number, y: number },

  insertCoin: () => set((state) => ({ credits: state.credits + 1 })),
  playGame: () => set((state) => {
    if (state.credits > 0 && state.clawState === 'IDLE') {
      return { credits: state.credits - 1, time: 30, clawState: 'IDLE' }; // 30 sec to position
    }
    return state;
  }),
  setClawState: (clawState) => set({ clawState }),
  setJoystickInput: (joystickInput) => set({ joystickInput }),
  grabPrize: (id) => set({ grabbedPrizeId: id }),
  releasePrize: () => set({ grabbedPrizeId: null }),
  tickTime: () => set((state) => {
    if (state.time > 0 && state.clawState === 'IDLE') {
      const newTime = state.time - 1;
      if (newTime === 0) {
        // Auto drop if time runs out
        return { time: 0, clawState: 'DROPPING' };
      }
      return { time: newTime };
    }
    return state;
  }),
}));

