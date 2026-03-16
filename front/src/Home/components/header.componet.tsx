
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isDarkModeAtom } from '../home.module';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useAtom(isDarkModeAtom);

  return (
    <header className="flex items-center px-3 py-2 justify-between bg-background-light dark:bg-background-dark h-full">
      <div className="flex w-10 shrink-0 items-center justify-start">
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="flex cursor-pointer items-center justify-center rounded-full h-8 w-8 bg-transparent text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          <span className="material-symbols-outlined text-2xl">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
      <h1 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
        {title}
      </h1>
      <div className="flex w-10 items-center justify-end">
        <button
          onClick={() => navigate('/settings')}
          className="flex cursor-pointer items-center justify-center rounded-full h-8 w-8 bg-transparent text-inherit hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
      </div>
    </header>
  );
};
