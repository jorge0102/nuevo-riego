
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isDarkModeAtom } from '../../Home/home.module';

interface ScheduleHeaderProps {
  title: string;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useAtom(isDarkModeAtom);

  return (
    <header className="flex items-center p-4 pb-2 justify-between bg-background-light dark:bg-background-dark">
      <button
        onClick={() => navigate('/')}
        className="flex size-12 shrink-0 items-center justify-center text-primary cursor-pointer"
      >
        <span className="material-symbols-outlined text-4xl">arrow_back</span>
      </button>
      <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] flex-1">{title}</h1>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-transparent text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          <span className="material-symbols-outlined text-2xl">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-transparent text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">settings</span>
        </button>
      </div>
    </header>
  );
};
