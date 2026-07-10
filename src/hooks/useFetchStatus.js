import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

export const useFetchStatus = () => {
  return useQuery({
    queryKey: ["status"],
    queryFn: () => fetcher(`${import.meta.env.VITE_API_BASE_URL}/status`),
    staleTime: 1000 * 15,
  });
};
