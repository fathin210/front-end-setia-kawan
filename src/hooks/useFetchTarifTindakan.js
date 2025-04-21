import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

export const useFetchTarifTindakan = () => {
  return useQuery({
    queryKey: ["tarifTindakan"],
    queryFn: () =>
      fetcher(
        `${import.meta.env.VITE_API_BASE_URL
        }/tarif-tindakan`
      ),
    staleTime: 1000 * 60 * 2,
  });
};
