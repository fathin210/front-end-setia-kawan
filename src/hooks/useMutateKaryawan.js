import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFetcher, postFetcher, putFetcher } from "../utils/fetcher";
import useAlertStore from "../store/alertStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/karyawan`;

export const useCreateKaryawan = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => postFetcher(baseURL, payload),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["karyawan"]);
      showAlert("Data karyawan berhasil diinputkan", "success");
    },
    onError: () => {
      showAlert("Gagal menyimpan data karyawan!", "error");
    }
  });
};

export const useUpdateKaryawan = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idkaryawan, ...payload }) => putFetcher(`${baseURL}/${idkaryawan}`, payload),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["karyawan"]);
      showAlert("Edit data karyawan berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal mengedit data karyawan!", "error");
    }
  });
};

export const useDeleteKaryawan = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idkaryawan) => deleteFetcher(`${baseURL}/${idkaryawan}`),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["karyawan"]);
      showAlert("Hapus data karyawan berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal menghapus data karyawan!", "error");
    }
  });
};
