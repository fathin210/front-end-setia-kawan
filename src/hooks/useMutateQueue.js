import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postFetcher, putFetcher } from "../utils/fetcher";
import moment from "moment";
import useSnackbarStore from "../store/snackbarStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/daftar`

export const useAddToQueueMutation = (onComplete) => {
  const { showSnackbar } = useSnackbarStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await postFetcher(baseURL, {
        nomorpasien: data.nomorpasien,
        nmpasien: data.nmpasien,
        tanggal: data?.tanggal ? data.tanggal : moment().format("YYYY-MM-DD"),
        tanggal_pelaks: moment(data?.tanggal_pelaks).format("YYYY-MM-DD"),
        tgl_lahir: data.tgl_lahir,
        jml_gigi: 0,
        tarif: 0,
        total_biaya: 0,
        komisi_kolektif: 0,
        komisi_pribadi: 0,
        komisi_pribadi2: 0,
        nkomisi_kolektif: 0,
        nkomisi_pribadi: 0,
        nkomisi_pribadi2: 0,
        biaya_perbaikan: 0,
        komisi_perbaikan: 0,
        ket: "",
        dp: 0,
      });
    },
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listQueue"]);
      showSnackbar("Pasien berhasil ditambahkan ke antrian!", "success");
      onComplete && onComplete()
    },
    onError: (error) => {
      console.error("Error:", error);
      showSnackbar("Gagal menambahkan pasien ke antrian!", "error");
    },
  });
};


export const useClearQueueMutation = ({ onComplete }) => {
  const { showSnackbar } = useSnackbarStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await putFetcher(`${baseURL}/${data?.id}`, {
        ...data,
        nomorpasien: data.nomorpasien,
        nmpasien: data.nmpasien,
        tanggal: data?.tanggal ? data.tanggal : moment().format("YYYY-MM-DD"),
        tanggal_pelaks: moment(data?.tanggal_pelaks).format("YYYY-MM-DD"),
        tgl_lahir: data.tgl_lahir,
        jml_gigi: 0,
        tarif: 0,
        total_biaya: 0,
        komisi_kolektif: 0,
        komisi_pribadi: 0,
        komisi_pribadi2: 0,
        nkomisi_kolektif: 0,
        nkomisi_pribadi: 0,
        nkomisi_pribadi2: 0,
        biaya_perbaikan: 0,
        komisi_perbaikan: 0,
        ket: "",
        dp: 0,
        kdtindakan: null,
        idkaryawan: null,
        jam: null,
        kdshift: null,
        batal_dp: true
      });
    },
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listQueue"]);
      showSnackbar("Data rincian berhasil diclear!", "success");
      onComplete && onComplete()
    },
    onError: (error) => {
      console.error("Error:", error);
      showSnackbar("Gagal clear data rincian!", "error");
    },
  });
};

export const useUpdateQueue = (onComplete = () => { }) => {
  const { showSnackbar } = useSnackbarStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await putFetcher(`${baseURL}/${data.id}`, data);
    },
    onMutate: () => {
      showSnackbar("Memproses permintaan...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listQueue"]);
      showSnackbar("Data rincian berhasil diupdate!", "success");
      onComplete && onComplete()
    },
    onError: (error) => {
      console.error("Error:", error);
      showSnackbar("Gagal mengupdate data rincian!", "error");
    },
  });
};
