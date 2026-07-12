import React from 'react';
import { Heart } from 'lucide-react';
import { Recommendation } from '@/app/actions';
import { CountryCode } from '@/hooks/useBookState';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface Props {
  recommendation: Recommendation;
  country: CountryCode;
  isFavorite: boolean;
  onToggleFavorite: (title: string) => void;
}

export function RecommendationCard({ recommendation, country, isFavorite, onToggleFavorite }: Props) {
  const { title, author, reasoning, estimated_price } = recommendation;
  const thaliaUrl = `https://www.thalia.${country}/suche?sq=${encodeURIComponent(title + ' ' + author)}`;

  return (
    <div className="flex gap-6 py-8 border-b border-[var(--color-thalia-gray-border)] bg-white relative group">
      {/* Thumbnail Placeholder */}
      <div className="w-28 h-40 bg-[var(--color-thalia-gray-light)] shadow-sm flex-shrink-0 rounded flex items-center justify-center border border-[var(--color-thalia-gray-border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-transparent"></div>
        <span className="text-xs text-gray-400 font-semibold z-10 uppercase tracking-widest">Cover</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="pr-12">
          <Badge className="mb-3 bg-black">Empfehlung</Badge>
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{title}</h3>
          <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">{author}</p>
          <div className="bg-[var(--color-thalia-gray-light)] p-3 rounded border border-[var(--color-thalia-gray-border)] mb-4">
             <p className="text-sm text-gray-700">
               <span className="font-semibold text-gray-900 block mb-1">Warum dieses Buch?</span>
               {reasoning}
             </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">{estimated_price}</span>
          <a href={thaliaUrl} target="_blank" rel="noopener noreferrer">
            <Button className="px-8 shadow-sm">Zum Artikel</Button>
          </a>
        </div>
      </div>

      {/* Heart Icon */}
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
    </div>
  );
}
