export const getHeaders = (isJson = true) => {
  const token = localStorage.getItem("access_token");
  const headers = {};

  if (isJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
};

const baseFetcher = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Terjadi kesalahan";

    try {
      const errorBody = await response.json();
      message = errorBody?.message || message;

      // 🔴 Cek jika token tidak valid atau expired
      if (response.status === 401 || /token/i.test(message)) {
        // Hapus token dari localStorage
        localStorage.removeItem("access_token");

        // Redirect ke login
        window.location.href = "/login";

        // Stop eksekusi berikutnya
        return;
      }
    } catch (e) {
      const errorText = await response.text();
      message = errorText;
    }

    throw new Error(message);
  }

  return response.json();
};


// 🔹 GET
export const fetcher = (url) => baseFetcher(url);

// 🔹 POST
export const postFetcher = (url, data) =>
  baseFetcher(url, {
    method: "POST",
    body: JSON.stringify(data),
  });

// 🔹 PUT
export const putFetcher = (url, data) =>
  baseFetcher(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// 🔹 DELETE
export const deleteFetcher = (url) =>
  baseFetcher(url, {
    method: "DELETE",
  });

export const pdfFetcher = (url) => baseFetcher(url, {
  method: "GET",
  headers: {
    "Content-Type": "application/pdf",
  },
})