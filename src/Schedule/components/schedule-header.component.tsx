
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ScheduleHeaderProps {
  title: string;
  onSettingsClick: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ title, onSettingsClick }) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center p-4 pb-2 justify-between bg-background-light dark:bg-background-dark">
      <button 
        onClick={() => navigate('/')}
        className="flex size-12 shrink-0 items-center justify-center text-primary cursor-pointer"
      >
        <span className="material-symbols-outlined text-4xl">arrow_back</span>
      </button>
      <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] flex-1">{title}</h1>
      <div className="flex w-12 items-center justify-end">
        <button
          onClick={onSettingsClick}
          className="flex cursor-pointer items-center justify-center rounded-full h-12 w-12 bg-transparent text-text-light dark:text-text-dark"
        >
          <span className="material-symbols-outlined text-3xl">settings</span>
        </button>
      </div>
    </header>
  );
};
