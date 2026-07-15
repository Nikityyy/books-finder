import React, { useEffect, useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { CountryCode } from '@/hooks/useBookState';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface BookCardProps {
  id?: string;
  type: 'read' | 'recommendation';
  title: string;
  author: string;
  coverUrl?: string;
  // Recommendation specific
  reasoning?: string;
  genre?: string;
  country?: CountryCode;
  isFavorite?: boolean;
  onToggleFavorite?: (title: string) => void;
  // Read book specific
  onRemove?: () => void;
}

export function BookCard({ 
  id, type, title, author, coverUrl, 
  reasoning, genre, country, isFavorite, onToggleFavorite,
  onRemove 
}: BookCardProps) {
  const [dynamicCover, setDynamicCover] = useState<string | undefined>(coverUrl);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isLoadingCover, setIsLoadingCover] = useState(!coverUrl);
  const [isLoadingDesc, setIsLoadingDesc] = useState(type === 'read');

  // Fetch cover if not provided
  useEffect(() => {
    if (!coverUrl) {
      setIsLoadingCover(true);
      const fetchCover = async () => {
        try {
          const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`);
          const data = await res.json();
          if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
            setDynamicCover(`https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-M.jpg`);
          }
        } catch (e) {
          console.error("Failed to fetch cover", e);
        } finally {
          setIsLoadingCover(false);
        }
      };
      fetchCover();
    } else {
      setIsLoadingCover(false);
    }
  }, [title, author, coverUrl]);

  // Fetch description for read books (resolving placeholder IDs if necessary)
  useEffect(() => {
    if (type === 'read' && id) {
      setIsLoadingDesc(true);
      const fetchDesc = async () => {
        try {
          let realId = id;
          if (!id.startsWith('/')) {
            // It's a placeholder ID, search OpenLibrary to get the real work ID first
            const searchRes = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`);
            const searchData = await searchRes.json();
            if (searchData.docs && searchData.docs.length > 0) {
              realId = searchData.docs[0].key; // e.g. "/works/OL123W"
            } else {
              setIsLoadingDesc(false);
              return; // Could not find book
            }
          }
          const res = await fetch(`https://openlibrary.org${realId}.json`);
          const data = await res.json();
          if (data.description) {
            setDescription(typeof data.description === 'string' ? data.description : data.description.value);
          }
        } catch (e) {
          console.error("Failed to fetch description", e);
        } finally {
          setIsLoadingDesc(false);
        }
      };
      fetchDesc();
    } else {
      setIsLoadingDesc(false);
    }
  }, [type, id, title, author]);

  const thaliaUrl = country ? `https://www.thalia.${country}/suche?sq=${encodeURIComponent(title + ' ' + author)}` : '#';
  const amazonUrl = `https://www.amazon.${country || 'de'}/s?k=${encodeURIComponent(title + ' ' + author)}`;

  return (
    <div className={`flex gap-3 sm:gap-6 border-b border-[var(--color-thalia-gray-border)] bg-white relative group ${type === 'read' ? 'py-4 sm:py-6' : 'py-6 sm:py-8'}`}>
      {/* Cover Image */}
      <div className={`flex-shrink-0 bg-[var(--color-thalia-gray-light)] shadow-sm rounded flex items-center justify-center border border-[var(--color-thalia-gray-border)] relative overflow-hidden ${type === 'read' ? 'w-20 h-32 sm:w-24 sm:h-36' : 'w-24 h-36 sm:w-28 sm:h-40'}`}>
        {isLoadingCover ? (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        ) : dynamicCover ? (
          <img src={dynamicCover} alt={`Cover von ${title}`} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-transparent"></div>
            <span className="text-xs text-gray-400 font-semibold z-10 uppercase tracking-widest">Cover</span>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="pr-8 sm:pr-12">
          {type === 'recommendation' && <Badge className="mb-2 sm:mb-3 bg-black">Empfehlung</Badge>}
          <h3 className={`${type === 'read' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} font-bold text-gray-900 leading-tight mb-1 break-words`}>{title}</h3>
          <p className="text-xs sm:text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider line-clamp-2">{author}</p>
          
          {type === 'recommendation' && reasoning && (
            <div className="bg-[var(--color-thalia-gray-light)] p-2 sm:p-3 rounded border border-[var(--color-thalia-gray-border)] mb-4 mt-2">
               <p className="text-xs sm:text-sm text-gray-700">
                 <span className="font-semibold text-gray-900 block mb-1">Warum dieses Buch?</span>
                 {reasoning}
               </p>
            </div>
          )}

          {type === 'read' && (
            isLoadingDesc ? (
              <div className="mt-2 sm:mt-3 space-y-2 animate-pulse max-w-md">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : description ? (
              <div className="mt-2 sm:mt-3">
                <p className={`text-xs sm:text-sm text-gray-600 leading-relaxed ${!isDescExpanded ? 'line-clamp-2' : ''}`}>
                  {description}
                </p>
                <button 
                  onClick={() => setIsDescExpanded(!isDescExpanded)} 
                  className="text-[var(--color-thalia-green)] text-xs font-semibold mt-1 hover:underline focus:outline-none"
                >
                  {isDescExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                </button>
              </div>
            ) : null
          )}
        </div>
        
        {type === 'recommendation' && (
          <div className="flex flex-wrap items-center justify-between mt-auto pt-3 sm:pt-4 gap-3">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              {genre && <Badge className="bg-[var(--color-thalia-gray-light)] text-gray-700 border border-[var(--color-thalia-gray-border)] whitespace-nowrap">{genre}</Badge>}
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <a href={amazonUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                <Button className="w-full sm:w-auto px-4 sm:px-6 shadow-sm bg-[#FF9900] hover:bg-[#E38800] text-black border-[#FF9900] font-semibold">Amazon</Button>
              </a>
              <a href={thaliaUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                <Button className="w-full sm:w-auto px-4 sm:px-6 shadow-sm">Thalia</Button>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Action Icons */}
      {type === 'recommendation' && onToggleFavorite && (
        <button 
          onClick={() => onToggleFavorite(title)}
          className="absolute top-6 sm:top-8 right-0 sm:right-2 text-gray-400 hover:text-[var(--color-thalia-green)] transition-colors p-2"
        >
          <Heart 
            size={24} 
            fill={isFavorite ? 'var(--color-thalia-green)' : 'none'} 
            color={isFavorite ? 'var(--color-thalia-green)' : 'currentColor'} 
            className="sm:w-[26px] sm:h-[26px]"
          />
        </button>
      )}

      {type === 'read' && onRemove && (
        <button 
          onClick={onRemove}
          className="absolute top-4 sm:top-6 right-0 sm:right-2 text-gray-400 hover:text-red-600 transition-colors p-2"
          title="Entfernen"
        >
          <Trash2 size={20} className="sm:w-[20px] sm:h-[20px]" />
        </button>
      )}
    </div>
  );
}
