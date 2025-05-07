import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

const useFetchQueue = (id) => {
    return useQuery({
        queryKey: ["queue", id],
        queryFn: () => {
            return fetcher(`${import.meta.env.VITE_API_BASE_URL}/daftar/${id}`);
        },
        staleTime: 1000 * 60 * 10, // Cache selama 20 detik
    });
};

export default useFetchQueue;
