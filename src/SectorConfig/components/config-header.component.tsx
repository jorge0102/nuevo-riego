
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ConfigHeaderProps {
  title: string;
  icon: string;
}

export const ConfigHeader: React.FC<ConfigHeaderProps> = ({ title, icon }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between pb-6">
      <div className="flex items-center gap-3">
        <div className="text-primary-dark dark:text-primary flex size-12 shrink-0 items-center justify-center">
          <span className="material-symbols-outlined !text-4xl">{icon}</span>
        </div>
        <h1 className="text-text-light dark:text-text-dark text-2xl font-bold leading-tight tracking-tight">
          {title}
        </h1>
      </div>
      <button 
        onClick={() => navigate('/schedule')}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
    </div>
  );
};
