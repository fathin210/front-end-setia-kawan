import { useQuery } from "@tanstack/react-query";
import { getHeaders } from "../utils/fetcher";

export const useFetchPDFCard = (id, nomorpasien, { enabled = false } = {}) => {
  return useQuery({
    queryKey: ["pdfKartu", id, nomorpasien],
    queryFn: async () => {
      const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/pdf/kartu`);
      if (id) {
        url.searchParams.append("id", id);
      } 
      if (nomorpasien) {
        url.searchParams.append("nomorpasien", nomorpasien);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
          ...getHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil file PDF");
      }

      return await response.blob();
    },
    enabled: enabled && Boolean(id) && Boolean(nomorpasien),
    staleTime: 0,
    cacheTime: 0,
    retry: false,
  });
};

