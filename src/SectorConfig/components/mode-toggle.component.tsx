
import React from 'react';

interface ModeToggleProps {
  isAuto: boolean;
  onChange: (isAuto: boolean) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ isAuto, onChange }) => {
  return (
    <div className="flex flex-col rounded-xl bg-card-light dark:bg-card-dark p-4">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="text-primary-dark dark:text-primary flex items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/10 shrink-0 size-12">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal flex-1 truncate">
            Modo Automático
          </p>
        </div>
        <div className="shrink-0">
          <label className={`relative flex h-8 w-[58px] cursor-pointer items-center rounded-full border-none p-1 transition-all ${
            isAuto 
              ? 'justify-end bg-primary' 
              : 'justify-start bg-background-light dark:bg-background-dark'
          }`}>
            <div 
              className="h-6 w-6 rounded-full bg-white transition-all duration-300"
              style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px' }}
            />
            <input 
              type="checkbox" 
              className="invisible absolute"
              checked={isAuto}
              onChange={(e) => onChange(e.target.checked)}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
