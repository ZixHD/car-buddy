import { create } from 'zustand';

interface ActiveVehicleState {
  activeVehicleId: string | null;
  setActiveVehicleId: (id: string | null) => void;
}

/**
 * Which vehicle the Diagnostics/History tabs are currently showing. Ephemeral UI
 * state only — not persisted — so it always defaults back to the first vehicle
 * (handled where it's consumed) on a fresh app start.
 */
export const useActiveVehicleStore = create<ActiveVehicleState>((set) => ({
  activeVehicleId: null,
  setActiveVehicleId: (id) => set({ activeVehicleId: id }),
}));
