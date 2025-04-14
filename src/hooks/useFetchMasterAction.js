import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

export const useFetchMasterAction = () => {
  return useQuery({
    queryKey: ["master_action"],
    queryFn: () =>
      fetcher(
        `${import.meta.env.VITE_API_BASE_URL
        }/tindakan`
      ),
    staleTime: 1000 * 60 * 5,
  });
};
