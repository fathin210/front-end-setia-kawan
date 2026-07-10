import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

export const useFetchJenisGigi = () => {
  return useQuery({
    queryKey: ["jenis_gigi"],
    queryFn: () => fetcher(`${import.meta.env.VITE_API_BASE_URL}/jenis-gigi`),
    staleTime: 1000 * 15,
  });
};
