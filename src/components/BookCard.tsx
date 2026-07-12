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

  // Fetch cover for recommendations if not provided
  useEffect(() => {
    if (type === 'recommendation' && !coverUrl) {
      const fetchCover = async () => {
        try {
          const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`);
          const data = await res.json();
          if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
            setDynamicCover(`https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-M.jpg`);
          }
        } catch (e) {
          console.error("Failed to fetch cover", e);
        }
      };
      fetchCover();
    }
  }, [type, title, author, coverUrl]);

  // Fetch description for read books
  useEffect(() => {
    if (type === 'read' && id) {
      const fetchDesc = async () => {
        try {
          const res = await fetch(`https://openlibrary.org${id}.json`);
          const data = await res.json();
          if (data.description) {
            setDescription(typeof data.description === 'string' ? data.description : data.description.value);
          }
        } catch (e) {
          console.error("Failed to fetch description", e);
        }
      };
      fetchDesc();
    }
  }, [type, id]);

  const thaliaUrl = country ? `https://www.thalia.${country}/suche?sq=${encodeURIComponent(title + ' ' + author)}` : '#';

  return (
    <div className={`flex gap-6 border-b border-[var(--color-thalia-gray-border)] bg-white relative group ${type === 'read' ? 'py-6' : 'py-8'}`}>
      {/* Cover Image */}
      <div className={`flex-shrink-0 bg-[var(--color-thalia-gray-light)] shadow-sm rounded flex items-center justify-center border border-[var(--color-thalia-gray-border)] relative overflow-hidden ${type === 'read' ? 'w-24 h-36' : 'w-28 h-40'}`}>
        {dynamicCover ? (
          <img src={dynamicCover} alt={`Cover von ${title}`} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-transparent"></div>
            <span className="text-xs text-gray-400 font-semibold z-10 uppercase tracking-widest">Cover</span>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="pr-12">
          {type === 'recommendation' && <Badge className="mb-3 bg-black">Empfehlung</Badge>}
          <h3 className={`${type === 'read' ? 'text-lg' : 'text-xl'} font-bold text-gray-900 leading-tight mb-1`}>{title}</h3>
          <p className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">{author}</p>
          
          {type === 'recommendation' && reasoning && (
            <div className="bg-[var(--color-thalia-gray-light)] p-3 rounded border border-[var(--color-thalia-gray-border)] mb-4 mt-2">
               <p className="text-sm text-gray-700">
                 <span className="font-semibold text-gray-900 block mb-1">Warum dieses Buch?</span>
                 {reasoning}
               </p>
            </div>
          )}

          {type === 'read' && description && (
            <div className="mt-3">
              <p className={`text-sm text-gray-600 leading-relaxed ${!isDescExpanded ? 'line-clamp-2' : ''}`}>
                {description}
              </p>
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)} 
                className="text-[var(--color-thalia-green)] text-xs font-semibold mt-1 hover:underline focus:outline-none"
              >
                {isDescExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
              </button>
            </div>
          )}
        </div>
        
        {type === 'recommendation' && (
          <div className="flex items-center justify-between mt-auto pt-4">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              {genre && <Badge className="bg-[var(--color-thalia-gray-light)] text-gray-700 border border-[var(--color-thalia-gray-border)]">{genre}</Badge>}
            </div>
            <a href={thaliaUrl} target="_blank" rel="noopener noreferrer">
              <Button className="px-8 shadow-sm">Zum Artikel</Button>
            </a>
          </div>
        )}
      </div>

      {/* Action Icons */}
      {type === 'recommendation' && onToggleFavorite && (
        <button 
          onClick={() => onToggleFavorite(title)}
          className="absolute top-8 right-2 text-gray-400 hover:text-[var(--color-thalia-green)] transition-colors p-2"
        >
          <Heart 
            size={26} 
            fill={isFavorite ? 'var(--color-thalia-green)' : 'none'} 
            color={isFavorite ? 'var(--color-thalia-green)' : 'currentColor'} 
          />
        </button>
      )}

      {type === 'read' && onRemove && (
        <button 
          onClick={onRemove}
          className="absolute top-6 right-2 text-gray-400 hover:text-red-600 transition-colors p-2"
          title="Entfernen"
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
}
