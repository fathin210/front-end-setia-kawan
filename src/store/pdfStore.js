import { create } from "zustand";

const usePdfStore = create((set) => ({
  isDialogOpen: false,
  pdfURL: null,
  title: "",
  loading: false,
  error: null,
  openDialog: (title) => set({ isDialogOpen: true, title, loading: true, error: null }),
  closeDialog: () => set({ isDialogOpen: false, pdfURL: null, title: "", loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPdfURL: (url) => set({ pdfURL: url }),
}));

export default usePdfStore;
