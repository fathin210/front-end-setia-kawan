import { create } from "zustand";

const useAlertStore = create((set) => ({
  open: false,
  message: "",
  severity: "waiting",

  showAlert: (message, severity = "waiting") =>
    set({ open: true, message, severity }),

  closeAlert: () => set({ open: false }),
}));

export default useAlertStore;
