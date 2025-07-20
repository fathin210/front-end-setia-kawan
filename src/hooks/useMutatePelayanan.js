import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFetcher, postFetcher, putFetcher } from "../utils/fetcher";
import useAlertStore from "../store/alertStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/pelayanan`;

export const useCreatePelayanan = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => postFetcher(baseURL, payload),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["master_pelayanan"]);
      showAlert("Master Pelayanan berhasil diinputkan", "success");
    },
    onError: () => {
      showAlert("Gagal menyimpan Master Pelayanan!", "error");
    }
  });
};

export const useUpdatePelayanan = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => putFetcher(`${baseURL}/${id}`, payload),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["master_pelayanan"]);
      showAlert("Edit Master Pelayanan berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal mengedit Master Pelayanan!", "error");
    }
  });
};

export const useDeletePelayanan = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteFetcher(`${baseURL}/${id}`),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["master_pelayanan"]);
      showAlert("Hapus Master Pelayanan berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal menghapus Master Pelayanan!", "error");
    }
  });
};
