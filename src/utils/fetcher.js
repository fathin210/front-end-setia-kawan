export const fetcher = (url) => fetch(url).then((res) => res.json());

export const postFetcher = async (url, data) => {
  const token = localStorage.getItem("access_token"); // Jika butuh token
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Jika pakai auth
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to post data");
  }

  return response.json();
};


export const putFetcher = async (url, data) => {
  const token = localStorage.getItem("access_token"); // Jika butuh token
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Jika pakai auth
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to post data");
  }

  return response.json();
};

export const deleteFetcher = async (url) => {
  const token = localStorage.getItem("access_token"); // Jika butuh token
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Jika pakai auth
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete data");
  }

  return response.json();
};