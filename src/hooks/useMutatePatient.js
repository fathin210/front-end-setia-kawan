import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postFetcher, putFetcher } from "../utils/fetcher";
import useSnackbarStore from "../store/snackbarStore";
import usePatientStore from "../store/patientStore";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/pasien`

export const useSubmitPatient = ({ editData, onComplete }) => {
  const { showSnackbar } = useSnackbarStore.getState();
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
      showSnackbar(
        editData ? "Memperbarui data pasien..." : "Menyimpan data pasien...",
        "info"
      );
    },
    onSuccess: (response) => {
      console.log("🚀 ~ useSubmitPatient ~ response:", response)

      queryClient.invalidateQueries(["patients"]);
      onComplete && onComplete(response);

      // Jika edit berhasil, perbarui activePatient dengan data terbaru
      if (editData) {
        updateActivePatient(response.data); // Perbarui state activePatient
      }

      showSnackbar(
        editData
          ? "Data pasien berhasil diperbarui!"
          : "Pasien berhasil ditambahkan!",
        "success"
      );
    },
    onError: () => {
      showSnackbar("Gagal menyimpan data pasien!", "error");
    },
  })
}