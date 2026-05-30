const BASE_URL = "https://react-bulk-backe-end.vercel.app";

export const fetchBooks = async () => {
      const res = await fetch(`${BASE_URL}/book`);
      return await res.json();
};