import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { postFetcher } from "../utils/fetcher";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const loginToStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data) => {
      const response = await postFetcher(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, data);
      return response;
    },
    onSuccess: ({ token, user }) => {
      loginToStore(user, token);
      localStorage.setItem("access_token", token);
      navigate("/"); // Redirect ke halaman utama setelah login sukses
    },
    onError: (error) => {
      console.error("Login gagal:", error.message);
      const message =
        error?.response?.data?.message || error.message || "Terjadi kesalahan";
      throw new Error(message);
    },
  });
};