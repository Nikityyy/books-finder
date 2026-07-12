import React from 'react';

interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  active?: boolean;
}

export function Pill({ children, active, className = '', ...props }: PillProps) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full border text-sm font-medium transition-colors
        ${active 
          ? 'bg-[var(--color-thalia-green)] text-white border-[var(--color-thalia-green)]' 
          : 'bg-white text-foreground border-[var(--color-thalia-gray-border)] hover:bg-[var(--color-thalia-gray-light)]'
        } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
