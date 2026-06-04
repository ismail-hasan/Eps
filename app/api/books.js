const BASE_URL = "https://eps-backend.vercel.app";

export const fetchBooks = async () => {
      const res = await fetch(`${BASE_URL}/color`);
      return await res.json();
};