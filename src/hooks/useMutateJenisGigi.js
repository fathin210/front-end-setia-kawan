import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFetcher, postFetcher, putFetcher } from "../utils/fetcher";
import useAlertStore from "../store/alertStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/jenis-gigi`;

export const useCreateJenisGigi = () => {
  const { showAlert } = useAlertStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => postFetcher(baseURL, payload),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["jenis_gigi"]);
      showAlert("Jenis gigi berhasil diinputkan", "success");
    },
    onError: () => {
      showAlert("Gagal menyimpan jenis gigi!", "error");
    },
  });
};

export const useUpdateJenisGigi = () => {
  const { showAlert } = useAlertStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => putFetcher(`${baseURL}/${id}`, payload),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["jenis_gigi"]);
      showAlert("Edit jenis gigi berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal mengedit jenis gigi!", "error");
    },
  });
};

export const useDeleteJenisGigi = () => {
  const { showAlert } = useAlertStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteFetcher(`${baseURL}/${id}`),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["jenis_gigi"]);
      showAlert("Hapus jenis gigi berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal menghapus jenis gigi!", "error");
    },
  });
};
