import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postFetcher, putFetcher } from "../utils/fetcher";
import usePatientStore from "../store/patientStore";
import useAlertStore from "../store/alertStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/pasien`

export const useSubmitPatient = ({ editData, onComplete }) => {
  const { showAlert } = useAlertStore.getState();
  const { updateActivePatient } = usePatientStore.getState();

  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (patientData) => {
      if (editData) {
        return await putFetcher(
          `${baseURL}/${editData.idpasien}`,
          patientData
        );
      } else {
        return await postFetcher(
          `${import.meta.env.VITE_API_BASE_URL}/pasien`,
          patientData
        );
      }
    },
    onMutate: () => {
      showAlert(
        editData ? "Memperbarui data pasien..." : "Menyimpan data pasien...",
        "waiting"
      );
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(["patients"]);
      onComplete && onComplete(response);

      // Jika edit berhasil, perbarui activePatient dengan data terbaru
      if (editData) {
        updateActivePatient(response.data); // Perbarui state activePatient
      }

      showAlert(
        editData
          ? "Data pasien berhasil diperbarui!"
          : "Pasien berhasil ditambahkan!",
        "success"
      );
    },
    onError: () => {
      showAlert("Gagal menyimpan data pasien!", "error");
    },
  })
}