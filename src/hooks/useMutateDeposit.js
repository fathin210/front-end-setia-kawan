import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFetcher, postFetcher, putFetcher } from "../utils/fetcher";
import useAlertStore from "../store/alertStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/dp`;

export const useCreateDeposit = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => postFetcher(baseURL, payload),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ["deposit"],
        type: 'all',
      });
      queryClient.refetchQueries({ queryKey: ["listQueue"], type: "all" });
      showAlert("Data deposit berhasil diinputkan", "success");
    },
    onError: () => {
      showAlert("Gagal menyimpan data deposit!", "error");
    }
  });
};

export const useUpdateDeposit = () => {
  const { showAlert } = useAlertStore.getState();


  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ iddp, ...payload }) => putFetcher(`${baseURL}/${iddp}`, payload),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ["deposit"],
        type: 'all',
      });
      showAlert("Edit data deposit berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal mengedit data deposit!", "error");
    }
  });
};

export const useDeleteDeposit = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ iddp }) => deleteFetcher(`${baseURL}/${iddp}`),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ["deposit"],
        type: 'all',
      });
      showAlert("Hapus data deposit berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal menghapus data deposit!", "error");
    }
  });
};
