'use client';
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/Button';
import { Search as SearchIcon } from 'lucide-react';
import { useBookState, Book } from '@/hooks/useBookState';
import { getRecommendations, Recommendation, getSeriesBooks } from './actions';

export default function Home() {
  const { readBooks, addReadBook, removeReadBook, favorites, toggleFavorite, country, setCountry } = useBookState();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [prompt, setPrompt] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingSeries, setIsAddingSeries] = useState(false);

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
          const books = data.docs.map((item: any) => ({
            id: item.key,
            title: item.title,
            author: item.author_name ? item.author_name.join(', ') : 'Unbekannter Autor',
            coverUrl: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : undefined
          }));
          setSearchResults(books);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAddSeries = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    // Close search dropdown immediately
    setSearchQuery('');
    setSearchResults([]);
    
    setIsAddingSeries(true);
    try {
      const seriesBooks = await getSeriesBooks(book.title, book.author);
      
      // Filter out duplicate books already in the list
      const booksToAdd = seriesBooks.filter(sb => {
        return !readBooks.some(rb => 
          rb.title.toLowerCase().trim() === sb.title.toLowerCase().trim()
        );
      });

      booksToAdd.forEach((sb, index) => {
        addReadBook({
           id: `series-${encodeURIComponent(sb.title.toLowerCase())}-${index}-${Date.now()}`,
           title: sb.title,
           author: sb.author,
           coverUrl: undefined 
        });
      });
    } catch(err) {
      console.error(err);
    } finally {
      setIsAddingSeries(false);
    }
  };

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleGetRecommendations = async (isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setRecommendations([]);
    }
    setError('');
    
    try {
      const results = await getRecommendations(
        prompt, 
        readBooks, 
        isLoadMore ? recommendations : []
      );
      
      if (isLoadMore) {
        setRecommendations(prev => [...prev, ...results]);
      } else {
        setRecommendations(results);
      }
    } catch (err: any) {
      setError(err?.message || 'Fehler beim Laden der Empfehlungen.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
      <Header country={country} onCountryChange={setCountry} />
      
      <main className="max-w-4xl mx-auto px-4 py-10 mt-4 space-y-16">
        
        {/* READ BOOKS SECTION */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center flex-wrap gap-3">
                <span>Meine gelesenen Bücher</span>
                {isAddingSeries && (
                  <span className="inline-flex items-center text-sm font-semibold text-[var(--color-thalia-green)] bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-[var(--color-thalia-green)] border-t-transparent rounded-full"></span>
                    Serie wird hinzugefügt...
                  </span>
                )}
              </h2>
              <p className="text-gray-600 mt-2">Diese Bücher fließen in deine Empfehlungen mit ein.</p>
            </div>
            
            <form onSubmit={(e) => e.preventDefault()} className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buch suchen und hinzufügen..."
                className="w-full h-11 pl-4 pr-10 rounded border border-[var(--color-thalia-gray-border)] focus:outline-none focus:border-[var(--color-thalia-green)] text-sm shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-thalia-green)] p-1 rounded-full">
                <SearchIcon size={20} />
              </div>

              {(searchResults.length > 0 || isSearching) && (
                <div className="mt-2 border border-[var(--color-thalia-gray-border)] rounded shadow-lg max-h-60 overflow-y-auto bg-white absolute w-full z-20">
                  {isSearching ? (
                    <div className="px-4 py-3 flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-12 bg-gray-200 rounded border border-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : (
                    searchResults.map(book => (
                      <div 
                        key={book.id} 
                        className="px-4 py-3 hover:bg-[var(--color-thalia-gray-light)] cursor-pointer text-sm border-b last:border-0 border-[var(--color-thalia-gray-border)] flex justify-between items-center"
                        onClick={() => {
                          addReadBook(book);
                          setSearchResults([]);
                          setSearchQuery('');
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {book.coverUrl ? (
                            <img src={book.coverUrl} className="w-8 h-12 object-cover rounded shadow-sm border border-gray-200" alt="cover" />
                          ) : (
                            <div className="w-8 h-12 bg-[var(--color-thalia-gray-light)] rounded border border-[var(--color-thalia-gray-border)]"></div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1">{book.title}</div>
                            <div className="text-gray-600 text-xs mt-0.5 line-clamp-1">{book.author}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="secondary"
                            className="text-xs px-2 py-1 bg-[var(--color-thalia-gray-light)] text-gray-700 hover:bg-gray-200 border border-[var(--color-thalia-gray-border)]"
                            onClick={(e) => handleAddSeries(e, book)}
                          >
                            📚 Ganze Serie
                          </Button>
                          <span className="text-[var(--color-thalia-green)] font-bold text-lg px-2">+</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="bg-white border border-[var(--color-thalia-gray-border)] rounded-xl shadow-sm p-4">
            {readBooks.length > 0 ? (
              <div className="flex flex-col">
                {readBooks.map((book) => (
                  <BookCard 
                    key={book.id}
                    id={book.id}
                    type="read"
                    title={book.title}
                    author={book.author}
                    coverUrl={book.coverUrl}
                    onRemove={() => removeReadBook(book.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>Du hast noch keine gelesenen Bücher hinzugefügt.</p>
              </div>
            )}
          </div>
        </section>

        {/* INSPIRATION & RECOMMENDATIONS SECTION */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Entdecke neue Bücher</h2>
            <p className="text-gray-600 mt-2">Lass dich inspirieren! Beschreibe, wonach dir der Sinn steht, oder lass das Feld leer für allgemeine Vorschläge.</p>
          </div>

          <div className="bg-white border border-[var(--color-thalia-gray-border)] rounded-xl shadow-sm p-6 mb-8">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Optional: z.B. Düsterer Sci-Fi Thriller in Wien"
              className="w-full h-24 p-4 rounded border border-[var(--color-thalia-gray-border)] focus:outline-none focus:border-[var(--color-thalia-green)] text-sm resize-none mb-4 leading-relaxed"
            />
            <Button onClick={() => handleGetRecommendations()} className="w-full text-lg py-3" disabled={isLoading}>
              {isLoading ? 'Suche Empfehlungen...' : 'Jetzt inspirieren lassen'}
            </Button>
          </div>

          {/* Results */}
          <div>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 mb-6">
                {error}
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="bg-white border border-[var(--color-thalia-gray-border)] rounded-xl shadow-sm p-4">
                <div className="flex flex-col">
                  {recommendations.map((rec, index) => (
                    <BookCard 
                      key={index}
                      type="recommendation"
                      title={rec.title}
                      author={rec.author}
                      reasoning={rec.reasoning}
                      genre={rec.genre}
                      country={country}
                      isFavorite={favorites.includes(rec.title)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
                
                <div className="mt-6 text-center pb-2">
                  <Button 
                    onClick={() => handleGetRecommendations(true)} 
                    disabled={isLoadingMore}
                    className="w-full md:w-auto px-8 py-2 bg-[var(--color-thalia-gray-light)] text-[var(--color-thalia-green)] hover:bg-[var(--color-thalia-green)] hover:text-white border border-[var(--color-thalia-green)]"
                  >
                    {isLoadingMore ? 'Lade weitere...' : 'Mehr anzeigen'}
                  </Button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-24 text-gray-500 bg-white border border-[var(--color-thalia-gray-border)] rounded-xl shadow-sm">
                <div className="animate-spin w-10 h-10 border-4 border-[var(--color-thalia-green)] border-t-transparent rounded-full mx-auto mb-6"></div>
                <p className="text-lg font-medium">Wir durchsuchen unser Sortiment...</p>
                <p className="text-sm mt-2 text-gray-400">Dies kann einen Moment dauern.</p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
