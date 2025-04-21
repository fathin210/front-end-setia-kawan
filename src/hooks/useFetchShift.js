import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

export const useFetchShift = () => {
  return useQuery({
    queryKey: ["shift"],
    queryFn: () =>
      fetcher(`${import.meta.env.VITE_API_BASE_URL}/shift`),
    staleTime: 1000 * 60 * 2, // 5 menit
  });
};
