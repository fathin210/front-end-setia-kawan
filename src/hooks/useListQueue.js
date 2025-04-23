import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

const useListQueue = (date, search, status = "x") => {
  return useQuery({
    queryKey: ["listQueue", date, search, status],
    queryFn: () => {
      return fetcher(`${import.meta.env.VITE_API_BASE_URL}/daftar?date=${date}&search=${search}&status=${status ?? ''}`)
    },
    staleTime: 1000 * 20, // Cache selama 20 detik
  });
};

export default useListQueue;
