import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

const useListQueue = (date, search) => {
  return useQuery({
    queryKey: ["listQueue", date, search],
    queryFn: () =>
      fetcher(
        `${import.meta.env.VITE_API_BASE_URL
        }/daftar?date=${date}&search=${search}`
      ),
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit
  });
};

export default useListQueue;
