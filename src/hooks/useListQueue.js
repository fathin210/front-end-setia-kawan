import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

const useListQueue = (date, search, status = "x", page, limit = 6, nomorpasien) => {
  return useQuery({
    queryKey: ["listQueue", date, search, status, page, limit, nomorpasien],
    queryFn: () => {
      const pageQuery = page ? `&page=${page}&limit=${limit}` : "";
      const nomorpasienQuery = nomorpasien ? `&nomorpasien=${nomorpasien}` : "";
      return fetcher(`${import.meta.env.VITE_API_BASE_URL}/daftar?date=${date}&search=${search}&status=${status ?? ''}${pageQuery}${nomorpasienQuery}`)
    },
    staleTime: 1000 * 2, // Cache selama 3 detik
    keepPreviousData: !!page,
  });
};

export default useListQueue;
