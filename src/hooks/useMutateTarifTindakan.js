import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFetcher, postFetcher, putFetcher } from "../utils/fetcher";
import useSnackbarStore from "../store/snackbarStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/tarif-tindakan`;

export const useCreateTarifTindakan = () => {
  const { showSnackbar } = useSnackbarStore.getState();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => postFetcher(baseURL, payload),
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tarifTindakan"]);
      showSnackbar("Tarif tindakan berhasil diinputkan", "success");
    },
    onError: () => {
      showSnackbar("Gagal menyimpan tarif tindakan!", "error");
    }
  });
};

export const useUpdateTarifTindakan = () => {
  const { showSnackbar } = useSnackbarStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kdtindakan, ...payload }) => putFetcher(`${baseURL}/${kdtindakan}`, payload),
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tarifTindakan"]);
      showSnackbar("Edit tarif tindakan berhasil disimpan", "success");
    },
    onError: () => {
      showSnackbar("Gagal mengedit tarif tindakan!", "error");
    }
  });
};

export const useDeleteTarifTindakan = () => {
  const { showSnackbar } = useSnackbarStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (kdtindakan) => deleteFetcher(`${baseURL}/${kdtindakan}`),
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tarifTindakan"]);
      showSnackbar("Hapus tarif tindakan berhasil disimpan", "success");
    },
    onError: () => {
      showSnackbar("Gagal menghapus tarif tindakan!", "error");
    }
  });
};
