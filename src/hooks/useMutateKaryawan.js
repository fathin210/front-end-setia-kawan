import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFetcher, postFetcher, putFetcher } from "../utils/fetcher";
import useSnackbarStore from "../store/snackbarStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/karyawan`;

export const useCreateKaryawan = () => {
  const { showSnackbar } = useSnackbarStore.getState();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => postFetcher(baseURL, payload),
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["karyawan"]);
      showSnackbar("Data karyawan berhasil diinputkan", "success");
    },
    onError: () => {
      showSnackbar("Gagal menyimpan data karyawan!", "error");
    }
  });
};

export const useUpdateKaryawan = () => {
  const { showSnackbar } = useSnackbarStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idkaryawan, ...payload }) => putFetcher(`${baseURL}/${idkaryawan}`, payload),
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["karyawan"]);
      showSnackbar("Edit data karyawan berhasil disimpan", "success");
    },
    onError: () => {
      showSnackbar("Gagal mengedit data karyawan!", "error");
    }
  });
};

export const useDeleteKaryawan = () => {
  const { showSnackbar } = useSnackbarStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idkaryawan) => deleteFetcher(`${baseURL}/${idkaryawan}`),
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["karyawan"]);
      showSnackbar("Hapus data karyawan berhasil disimpan", "success");
    },
    onError: () => {
      showSnackbar("Gagal menghapus data karyawan!", "error");
    }
  });
};
