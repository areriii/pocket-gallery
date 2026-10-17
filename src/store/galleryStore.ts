import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Artwork } from "../api/cma";

export type SavedArtwork = Artwork & {
  savedAt: number;
  note: string;
  roomId: string | null;
};

export type Room = { id: string; name: string };

type GalleryState = {
  items: SavedArtwork[];
  rooms: Room[];
  save: (art: Artwork) => void;
  remove: (id: number) => void;
  setNote: (id: number, note: string) => void;
  addRoom: (name: string) => void;
  removeRoom: (roomId: string) => void;
  moveToRoom: (id: number, roomId: string | null) => void;
};

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set, get) => ({
      items: [],
      rooms: [],

      save: (art) => {
        if (get().items.some((i) => i.id === art.id)) return;
        const item: SavedArtwork = {
          id: art.id,
          title: art.title,
          artist: art.artist,
          date: art.date,
          yearStart: art.yearStart,
          imageUrl: art.imageUrl,
          savedAt: Date.now(),
          note: "",
          roomId: null,
        };
        set((state) => ({ items: [item, ...state.items] }));
      },

      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      setNote: (id, note) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, note } : i)),
        })),

      addRoom: (name) =>
        set((state) => ({
          rooms: [...state.rooms, { id: crypto.randomUUID(), name }],
        })),

      removeRoom: (roomId) =>
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== roomId),
          items: state.items.map((i) =>
            i.roomId === roomId ? { ...i, roomId: null } : i
          ),
        })),

      moveToRoom: (id, roomId) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, roomId } : i)),
        })),
    }),
    { name: "pocket-gallery" }
  )
);