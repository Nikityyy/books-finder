'use client';
import React, { useState } from 'react';
import { Pill } from './ui/Pill';
import { Button } from './ui/Button';
import { X, Search as SearchIcon } from 'lucide-react';
import { Book } from '@/hooks/useBookState';

interface Props {
  readBooks: Book[];
  onAddReadBook: (b: Book) => void;
  onRemoveReadBook: (id: string) => void;
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function PreferenceForm({ readBooks, onAddReadBook, onRemoveReadBook, onSubmit, isLoading }: Props) {
  const [prompt, setPrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const handleSearchBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      // Switched to Open Library API which has no strict quota limits without an API key
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await res.json();
      if (data.docs && data.docs.length > 0) {
        const books = data.docs.map((item: any) => ({
          id: item.key,
          title: item.title,
          author: item.author_name ? item.author_name.join(', ') : 'Unbekannter Autor',
        }));
        setSearchResults(books);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-[var(--color-thalia-gray-border)] shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Deine Lesevorlieben</h2>
      
      {/* Bereits gelesen */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Bereits gelesen</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {readBooks.map(book => (
            <Pill key={book.id} className="pr-2 bg-[var(--color-thalia-gray-light)]" onClick={() => onRemoveReadBook(book.id)}>
              <span className="max-w-[200px] truncate">{book.title}</span>
              <X size={14} className="ml-2 text-gray-500 hover:text-red-500" />
            </Pill>
          ))}
          {readBooks.length === 0 && <span className="text-sm text-gray-500 italic">Noch keine Bücher hinzugefügt.</span>}
        </div>

        {/* Book Search */}
        <form onSubmit={handleSearchBook} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buch suchen und hinzufügen..."
            className="w-full h-11 pl-4 pr-10 rounded border border-[var(--color-thalia-gray-border)] focus:outline-none focus:border-[var(--color-thalia-green)] text-sm"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-thalia-green)] p-1 hover:bg-[var(--color-thalia-gray-light)] rounded-full">
            <SearchIcon size={20} />
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-2 border border-[var(--color-thalia-gray-border)] rounded shadow-sm max-h-48 overflow-y-auto bg-white absolute w-[calc(100%-3rem)] max-w-sm z-10">
            {searchResults.map(book => (
              <div 
                key={book.id} 
                className="px-4 py-3 hover:bg-[var(--color-thalia-gray-light)] cursor-pointer text-sm border-b last:border-0 border-[var(--color-thalia-gray-border)] flex justify-between items-center"
                onClick={() => {
                  onAddReadBook(book);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
              >
                <div>
                  <div className="font-bold text-gray-900">{book.title}</div>
                  <div className="text-gray-600 text-xs mt-0.5">{book.author}</div>
                </div>
                <span className="text-[var(--color-thalia-green)] font-bold text-lg">+</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prompt Form */}
      <form onSubmit={handleSubmit}>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Was suchst du?</h3>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="z.B. Düsterer Sci-Fi Thriller in Wien"
          className="w-full h-32 p-4 rounded border border-[var(--color-thalia-gray-border)] focus:outline-none focus:border-[var(--color-thalia-green)] text-sm resize-none mb-4 leading-relaxed"
        />
        <Button type="submit" className="w-full text-lg py-3" disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Suche Empfehlungen...' : 'Jetzt inspirieren lassen'}
        </Button>
      </form>
    </div>
  );
}
