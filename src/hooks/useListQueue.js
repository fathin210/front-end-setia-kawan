import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

const useListQueue = (date, search, status = "x", page, limit = 6) => {
  return useQuery({
    queryKey: ["listQueue", date, search, status, page, limit],
    queryFn: () => {
      const pageQuery = page ? `&page=${page}&limit=${limit}` : "";
      return fetcher(`${import.meta.env.VITE_API_BASE_URL}/daftar?date=${date}&search=${search}&status=${status ?? ''}${pageQuery}`)
    },
    staleTime: 1000 * 5, // Cache selama 20 detik
    keepPreviousData: !!page,
  });
};

export default useListQueue;
