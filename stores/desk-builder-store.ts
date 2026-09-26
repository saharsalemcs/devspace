"use client";

import { create } from "zustand";

export interface BuilderSelection {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
}

interface DeskBuilderState {
  selections: BuilderSelection[];
  selectProduct: (selection: BuilderSelection) => void;
  removeSlot: (categoryId: string) => void;
  reset: () => void;
}

export const useDeskBuilderStore = create<DeskBuilderState>()((set) => ({
  selections: [],

  selectProduct: (selection) =>
    set((state) => ({
      selections: [
        ...state.selections.filter(
          (item) => item.categoryId !== selection.categoryId,
        ),
        selection,
      ],
    })),

  removeSlot: (categoryId) =>
    set((state) => ({
      selections: state.selections.filter(
        (item) => item.categoryId !== categoryId,
      ),
    })),

  reset: () => set({ selections: [] }),
}));
