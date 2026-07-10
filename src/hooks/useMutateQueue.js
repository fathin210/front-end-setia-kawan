import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFetcher, postFetcher, putFetcher } from "../utils/fetcher";
import moment from "moment";
import useAlertStore from "../store/alertStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/daftar`

export const useAddToQueueMutation = (onComplete) => {
  const { showAlert } = useAlertStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await postFetcher(baseURL, {
        nomorpasien: data.nomorpasien,
        nmpasien: data.nmpasien,
        tanggal: data?.tanggal ? data.tanggal : moment().format("YYYY-MM-DD"),
        tanggal_pelaks: moment(data?.tanggal_pelaks).format("YYYY-MM-DD"),
        idkaryawan: data?.idkaryawan || null,
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
        ket: data?.ket ? data.ket : null,
        dp: 0,
      });
    },
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listQueue"]);
      showAlert("Pasien berhasil ditambahkan ke antrian!", "success");
      onComplete && onComplete()
    },
    onError: (error) => {
      console.error("Error:", error);
      showAlert("Gagal menambahkan pasien ke antrian!", "error");
    },
  });
};


export const useClearQueueMutation = ({ onComplete }) => {
  const { showAlert } = useAlertStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    // Pakai endpoint /reset khusus — route PUT /:id generik butuh tarif yang
    // valid buat lookup jenis gigi, jadi gagal kalau dikirim tarif: 0.
    mutationFn: (data) => putFetcher(`${baseURL}/${data?.id}/reset`),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listQueue"]);
      showAlert("Data rincian berhasil diclear!", "success");
      onComplete && onComplete()
    },
    onError: (error) => {
      console.error("Error:", error);
      showAlert("Gagal clear data rincian!", "error");
    },
  });
};

export const useUpdateQueue = (onComplete = () => { }) => {
  const { showAlert } = useAlertStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await putFetcher(`${baseURL}/${data.id}`, data);
    },
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listQueue"]);
      showAlert("Data rincian berhasil diupdate!", "success");
      onComplete && onComplete()
    },
    onError: (error) => {
      console.error("Error:", error);
      showAlert("Gagal mengupdate data rincian!", "error");
    },
  });
};

export const useMoveQueueMutation = () => {
  const { showAlert } = useAlertStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, nomorpasien_tujuan }) =>
      putFetcher(`${baseURL}/${id}/pindahkan`, { nomorpasien_tujuan }),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listQueue"]);
      showAlert("Transaksi berhasil dipindahkan", "success");
    },
    onError: () => {
      showAlert("Gagal memindahkan transaksi!", "error");
    },
  });
};

export const useUpdateQueueStatus = () => {
  const { showAlert } = useAlertStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ket }) => putFetcher(`${baseURL}/${id}/status`, { ket }),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listQueue"]);
      showAlert("Status berhasil diubah", "success");
    },
    onError: () => {
      showAlert("Gagal mengubah status!", "error");
    },
  });
};

export const useUpdateQueueTindakan = () => {
  const { showAlert } = useAlertStore.getState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, kdtindakan, idkaryawan }) =>
      putFetcher(`${baseURL}/${id}/tindakan`, { kdtindakan, idkaryawan }),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listQueue"]);
      showAlert("Antrian berhasil diubah", "success");
    },
    onError: () => {
      showAlert("Gagal mengubah antrian!", "error");
    },
  });
};

export const useDeleteQueue = () => {
  const { showAlert } = useAlertStore.getState();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteFetcher(`${baseURL}/${id}`),
    onMutate: () => {
      showAlert("Memproses permintaan...", "waiting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listQueue"]);
      showAlert("Hapus data rincian berhasil disimpan", "success");
    },
    onError: () => {
      showAlert("Gagal menghapus data rincian!", "error");
    }
  });

};
