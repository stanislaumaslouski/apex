import React from 'react';

interface FlagProps {
  code: string;
  size?: number;
  className?: string;
}

export const Flag: React.FC<FlagProps> = ({ code, size = 24, className = '' }) => {
  if (!code || code === 'all') return <span className="text-xl">🌍</span>;

  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={`${code} flag`}
      width={size}
      height={size * 0.75}
      className={`rounded-sm shadow-sm ${className}`}
      style={{ objectFit: 'cover', flexShrink: 0 }}
    />
  );
};