import { create } from 'zustand'

interface WarRoomUiState {
  selectedSystemFilters: string[]
  simulatedClaims: string[]
  benchOverrides: Record<string, boolean>
  toggleSystemFilter: (system: string) => void
  simulateClaim: (playerKey: string) => void
  clearSimulatedClaims: () => void
  toggleBenchOverride: (playerKey: string) => void
}

export const useWarRoomStore = create<WarRoomUiState>((set) => ({
  selectedSystemFilters: [],
  simulatedClaims: [],
  benchOverrides: {},
  toggleSystemFilter: (system) =>
    set((state) => ({
      selectedSystemFilters: state.selectedSystemFilters.includes(system)
        ? state.selectedSystemFilters.filter((s) => s !== system)
        : [...state.selectedSystemFilters, system],
    })),
  simulateClaim: (playerKey) =>
    set((state) => ({
      simulatedClaims: state.simulatedClaims.includes(playerKey)
        ? state.simulatedClaims
        : [...state.simulatedClaims, playerKey],
    })),
  clearSimulatedClaims: () => set({ simulatedClaims: [] }),
  toggleBenchOverride: (playerKey) =>
    set((state) => ({
      benchOverrides: {
        ...state.benchOverrides,
        [playerKey]: !state.benchOverrides[playerKey],
      },
    })),
}))
