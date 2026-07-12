import React from 'react';
import { Search, ShoppingCart, User, Heart } from 'lucide-react';
import { CountryCode } from '@/hooks/useBookState';

interface HeaderProps {
  country: CountryCode;
  onCountryChange: (c: CountryCode) => void;
}

export function Header({ country, onCountryChange }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-[var(--color-thalia-gray-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Mockup */}
        <div className="flex-shrink-0 flex items-center">
          <span className="text-[var(--color-thalia-green)] text-3xl font-extrabold tracking-tight">Book Finder</span>
        </div>

        {/* Search Bar Removed (No feature) */}
        <div className="flex-1 max-w-2xl mx-8"></div>

        {/* Actions & Country Selector */}
        <div className="flex items-center gap-6">
          <div className="text-sm bg-transparent border-none focus:outline-none font-semibold uppercase text-gray-700">
            AT
          </div>
        </div>
      </div>
    </header>
  );
}
