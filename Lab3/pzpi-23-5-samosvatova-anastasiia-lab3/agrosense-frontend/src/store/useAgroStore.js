import { create } from 'zustand';
import { 
  getMyGreenhousesApi, 
  createGreenhouseApi, 
  updateGreenhouseApi, 
  deleteGreenhouseApi 
} from '../api/user.api';

const useAgroStore = create((set, get) => ({
  greenhouses: [],
  isLoading: false,
  error: null,

  fetchGreenhouses: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getMyGreenhousesApi();
      set({ greenhouses: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch greenhouses', 
        isLoading: false 
      });
    }
  },

  createGreenhouse: async (greenhouseData) => {
    set({ isLoading: true, error: null });
    try {
      const newGreenhouse = await createGreenhouseApi(greenhouseData);
      set((state) => ({
        greenhouses: [...state.greenhouses, newGreenhouse],
        isLoading: false
      }));
      return newGreenhouse;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create greenhouse', isLoading: false });
      throw error;
    }
  },

  updateGreenhouse: async (id, greenhouseData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGreenhouse = await updateGreenhouseApi(id, greenhouseData);
      set((state) => ({
        greenhouses: state.greenhouses.map((gh) => 
          gh.id === id ? { ...gh, ...updatedGreenhouse } : gh
        ),
        isLoading: false
      }));
      return updatedGreenhouse;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update greenhouse', isLoading: false });
      throw error;
    }
  },

  deleteGreenhouse: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteGreenhouseApi(id);
      set((state) => ({
        greenhouses: state.greenhouses.filter((gh) => gh.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete greenhouse', isLoading: false });
      throw error;
    }
  }
}));

export default useAgroStore;