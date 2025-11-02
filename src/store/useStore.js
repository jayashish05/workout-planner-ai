import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      userData: null,
      fitnessPlan: null,
      darkMode: false,
      savedPlans: [],
      
      setUserData: (data) => set({ userData: data }),
      setFitnessPlan: (plan) => set({ fitnessPlan: plan }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      savePlan: (plan) => set((state) => ({
        savedPlans: [...state.savedPlans, { ...plan, savedAt: new Date().toISOString() }]
      })),
      
      clearPlan: () => set({ userData: null, fitnessPlan: null }),
      
      deleteSavedPlan: (index) => set((state) => ({
        savedPlans: state.savedPlans.filter((_, i) => i !== index)
      })),
    }),
    {
      name: 'fitness-coach-storage',
    }
  )
);

export default useStore;
