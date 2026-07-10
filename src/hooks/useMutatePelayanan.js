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
      showAlert("Komisi karyawan berhasil diinputkan", "success");
    },
    onError: () => {
      showAlert("Gagal menyimpan komisi karyawan!", "error");
    },
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
      showAlert("Edit komisi karyawan berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal mengedit komisi karyawan!", "error");
    },
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
      showAlert("Hapus komisi karyawan berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal menghapus komisi karyawan!", "error");
    },
  });
};
