import { useQuery } from "@tanstack/react-query";
import { getHeaders } from "../utils/fetcher";

export const useFetchPDFInvoice = (id, { enabled = false } = {}) => {
  return useQuery({
    queryKey: ["pdfInvoice", id],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/pdf/invoice?id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/pdf",
            ...getHeaders()
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil file PDF");
      }

      return await response.blob(); // Mengembalikan data dalam bentuk blob
    },
    enabled: enabled && Boolean(id),
    staleTime: 0,
    cacheTime: 0,
    retry: false,
  });
};
