import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePatientStore = create(
  persist(
    (set) => ({
      activePatient: null, // Menyimpan pasien yang sedang dipilih
      setActivePatient: (patient) => set({ activePatient: patient }),
      clearActivePatient: () => set({ activePatient: null }),
      updateActivePatient: (updatedData) => set({ activePatient: updatedData }),
    }),
    {
      name: "active-patient-storage", // Key untuk localStorage
    }
  )
);

export default usePatientStore;
