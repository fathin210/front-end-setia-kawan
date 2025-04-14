import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFetcher, postFetcher, putFetcher } from "../utils/fetcher";
import useSnackbarStore from "../store/snackbarStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/dp`;

export const useCreateDeposit = () => {
  const { showSnackbar } = useSnackbarStore.getState();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => postFetcher(baseURL, payload),
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["deposit"]);
      showSnackbar("Data deposit berhasil diinputkan", "success");
    },
    onError: () => {
      showSnackbar("Gagal menyimpan data deposit!", "error");
    }
  });
};

export const useUpdateDeposit = () => {
  const { showSnackbar } = useSnackbarStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ iddp, ...payload }) => putFetcher(`${baseURL}/${iddp}`, payload),
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["deposit"]);
      showSnackbar("Edit data deposit berhasil disimpan", "success");
    },
    onError: () => {
      showSnackbar("Gagal mengedit data deposit!", "error");
    }
  });
};

export const useDeleteDeposit = () => {
  const { showSnackbar } = useSnackbarStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ iddp }) => deleteFetcher(`${baseURL}/${iddp}`),
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["deposit"]);
      showSnackbar("Hapus data deposit berhasil disimpan", "success");
    },
    onError: () => {
      showSnackbar("Gagal menghapus data deposit!", "error");
    }
  });
};
