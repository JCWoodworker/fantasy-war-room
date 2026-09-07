import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MANAGED_TEAMS = [
  {
    id: 'grok_bowers' as const,
    teamName: 'Grok Bowers',
    ownerName: 'James',
    shortLabel: 'James',
  },
  {
    id: 'two_pint_conversion' as const,
    teamName: 'Two-Pint conversion',
    ownerName: 'Amanda',
    shortLabel: 'Amanda',
  },
]

export type ManagedTeamId = (typeof MANAGED_TEAMS)[number]['id']

interface WarRoomUiState {
  activeTeamId: ManagedTeamId
  setActiveTeamId: (teamId: ManagedTeamId) => void
  selectedSystemFilters: string[]
  simulatedClaims: string[]
  toggleSystemFilter: (system: string) => void
  simulateClaim: (playerKey: string) => void
  clearSimulatedClaims: () => void
}

export const useWarRoomStore = create<WarRoomUiState>()(
  persist(
    (set) => ({
      activeTeamId: 'grok_bowers',
      setActiveTeamId: (teamId) =>
        set((state) =>
          state.activeTeamId === teamId
            ? state
            : {
                activeTeamId: teamId,
                // Session UI must not carry claims/filters across identities
                selectedSystemFilters: [],
                simulatedClaims: [],
              },
        ),
      selectedSystemFilters: [],
      simulatedClaims: [],
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
    }),
    {
      name: 'grok-warroom-ui',
      partialize: (state) => ({ activeTeamId: state.activeTeamId }),
    },
  ),
)

export function getManagedTeam(teamId: ManagedTeamId) {
  return MANAGED_TEAMS.find((t) => t.id === teamId) ?? MANAGED_TEAMS[0]
}
