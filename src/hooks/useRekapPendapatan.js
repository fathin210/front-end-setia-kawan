import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

export const useFetchRekapPendapatan = (periode, tahun, bulan) => {
  return useQuery({
    queryKey: ["summaryEarning", periode, tahun, bulan],
    queryFn: () =>
      fetcher(
        `${import.meta.env.VITE_API_BASE_URL
        }/rekap?periode=${periode}&tahun=${tahun}&bulan=${bulan}`
      ),
    staleTime: 1000 * 60 * 5,
  });
};


export const useFetchDashboard = () => {
  return useQuery({
    queryKey: ["summaryQueue",],
    queryFn: () =>
      fetcher(`${import.meta.env.VITE_API_BASE_URL}/rekap/dashboard`),
    staleTime: 1000 * 60 * 5,
  });
};
