import { useState, useEffect } from 'react';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
}

export type CountryCode = 'at';

export function useBookState() {
  const [readBooks, setReadBooks] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]); // book titles or IDs
  const [country, setCountry] = useState<CountryCode>('at');

  // Load from local storage on mount
  useEffect(() => {
    const savedRead = localStorage.getItem('thalia_readBooks');
    if (savedRead) setReadBooks(JSON.parse(savedRead));

    const savedFavs = localStorage.getItem('thalia_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedCountry = localStorage.getItem('thalia_country') as CountryCode;
    if (savedCountry) setCountry(savedCountry);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('thalia_readBooks', JSON.stringify(readBooks));
  }, [readBooks]);

  useEffect(() => {
    localStorage.setItem('thalia_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('thalia_country', country);
  }, [country]);

  const addReadBook = (book: Book) => {
    if (!readBooks.find(b => b.id === book.id)) {
      setReadBooks([...readBooks, book]);
    }
  };

  const removeReadBook = (id: string) => {
    setReadBooks(readBooks.filter(b => b.id !== id));
  };

  const toggleFavorite = (title: string) => {
    if (favorites.includes(title)) {
      setFavorites(favorites.filter(f => f !== title));
    } else {
      setFavorites([...favorites, title]);
    }
  };

  return {
    readBooks,
    addReadBook,
    removeReadBook,
    favorites,
    toggleFavorite,
    country,
    setCountry
  };
}
