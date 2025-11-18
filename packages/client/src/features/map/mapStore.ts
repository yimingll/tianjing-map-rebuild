import { create } from 'zustand'
import { MapData } from '@/types/map'

interface MapStore {
  mapData: MapData | null
  setMapData: (data: MapData) => void
  clearMapData: () => void
}

export const useMapStore = create<MapStore>((set) => ({
  mapData: null,
  setMapData: (data) => set({ mapData: data }),
  clearMapData: () => set({ mapData: null })
}))
