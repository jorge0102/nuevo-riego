
import React from 'react';

interface HeaderProps {
  title: string;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onSettingsClick }) => {
  return (
    <header className="flex items-center px-3 py-2 justify-between bg-background-light dark:bg-background-dark h-full">
      <div className="flex w-10 shrink-0 items-center justify-start">
        <span className="material-symbols-outlined text-2xl text-primary">
          partly_cloudy_day
        </span>
      </div>
      <h1 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
        {title}
      </h1>
      <div className="flex w-10 items-center justify-end">
        <button
          onClick={onSettingsClick}
          className="flex cursor-pointer items-center justify-center rounded-full h-8 w-8 bg-transparent text-inherit hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
      </div>
    </header>
  );
};
