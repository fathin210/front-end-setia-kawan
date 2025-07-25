import { create } from "zustand";

const useSnackbarStore = create((set) => ({
  open: false,
  message: "",
  severity: "info", // success | error | warning | info

  showSnackbar: (message, severity = "info") =>
    set({ open: true, message, severity }),

  closeSnackbar: () => set({ open: false }),
}));

export default useSnackbarStore;
