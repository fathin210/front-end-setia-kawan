import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

export const useFetchKaryawan = (search = "") => {
  return useQuery({
    queryKey: ["karyawan", search],
    queryFn: () =>
      fetcher(`${import.meta.env.VITE_API_BASE_URL}/karyawan?search=${search}`),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
};
