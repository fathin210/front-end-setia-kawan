import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFetcher, postFetcher, putFetcher } from "../utils/fetcher";
import useAlertStore from "../store/alertStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/tarif-tindakan`;

export const useCreateTarifTindakan = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => postFetcher(baseURL, payload),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tarifTindakan"]);
      showAlert("Tarif tindakan berhasil diinputkan", "success");
    },
    onError: () => {
      showAlert("Gagal menyimpan tarif tindakan!", "error");
    }
  });
};

export const useUpdateTarifTindakan = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kdtindakan, ...payload }) => putFetcher(`${baseURL}/${kdtindakan}`, payload),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tarifTindakan"]);
      showAlert("Edit tarif tindakan berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal mengedit tarif tindakan!", "error");
    }
  });
};

export const useDeleteTarifTindakan = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (kdtindakan) => deleteFetcher(`${baseURL}/${kdtindakan}`),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tarifTindakan"]);
      showAlert("Hapus tarif tindakan berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal menghapus tarif tindakan!", "error");
    }
  });
};
