import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

export const useFetchMasterPelayanan = () => {
  return useQuery({
    queryKey: ["master_pelayanan"],
    queryFn: () =>
      fetcher(
        `${import.meta.env.VITE_API_BASE_URL
        }/pelayanan`
      ),
    staleTime: 1000 * 60 * 2,
  });
};
