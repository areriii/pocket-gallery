import { create } from "zustand";
import { persist } from "zustand/middleware";

type GameState = {
    bestScore: number;
    gamePlayed: number;
    recordGame: (score: number) => void;
};

export const useGameStore = create<GameState>()(
    persist(
        (set) => ({
            bestScore: 0,
            gamePlayed: 0,
            recordGame: (score) => {
                set((s) => ({
                    bestScore: Math.max(s.bestScore, score),
                    gamePlayed: s.gamePlayed + 1,
                }));
            },
        }),
        {
            name: "pocket-gallery-game",
        }
    )
);