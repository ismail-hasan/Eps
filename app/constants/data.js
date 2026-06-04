import { useEffect, useState } from "react";

const BASE_URL = "https://eps-backend.vercel.app/book";

export const useBooks = () => {
  const [booksData, setBooksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/book`);
      const data = await res.json();

      setBooksData(data);
    } catch (err) {
      setError(err.message);
      // console.log("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return { booksData, loading, error, refetch: fetchBooks };
};

