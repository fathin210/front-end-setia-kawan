import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/dp`

export const useFetchDeposit = (nomorpasien = null, iddp = null) => {
  return useQuery({
    queryKey: ["deposit", nomorpasien, iddp],
    queryFn: ({ queryKey }) => {
      const [, nomorpasien, iddp] = queryKey;

      let url = `${baseURL}/${nomorpasien}`;
      if (iddp) {
        url += `?iddp=${iddp}`;
      }

      return fetcher(nomorpasien ? url : baseURL);
    },
    staleTime: 1000 * 60 * 2,
  });
};
