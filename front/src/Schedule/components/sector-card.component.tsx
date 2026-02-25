
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sector } from '../schedule.state';


interface SectorCardProps {
  sector: Sector;
  onToggle: (id: number, isActive: boolean) => void;
  onModeChange: (id: number, isAuto: boolean) => void;
}

export const SectorCard: React.FC<SectorCardProps> = ({ sector, onToggle }) => {
  const navigate = useNavigate();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(sector.id, !sector.isActive);
  };

  const handleCardClick = () => {
    navigate(`/sector/${sector.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="flex flex-col items-stretch justify-start rounded-xl shadow-sm bg-surface-light dark:bg-surface-dark p-4 gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div 
          className={`flex items-center justify-center rounded-lg size-14 shrink-0 ${
            sector.color === 'secondary' 
              ? 'bg-secondary/20 text-secondary' 
              : 'bg-primary/20 text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-4xl">{sector.icon}</span>
        </div>
        
        <div className="flex-grow">
          <p className="text-lg font-bold leading-tight tracking-[-0.015em]">{sector.name}</p>
          <div className="flex gap-2 pt-2 flex-wrap">
            <div 
              className={`flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full px-3 ${
                sector.isActive 
                  ? 'bg-secondary/80' 
                  : 'bg-inactive-light dark:bg-inactive-dark'
              }`}
            >
              <span className={`material-symbols-outlined text-base ${sector.isActive ? 'text-white' : ''}`}>
                {sector.isActive ? 'play_circle' : 'pause_circle'}
              </span>
              <p className={`text-sm font-medium leading-normal ${sector.isActive ? 'text-white' : ''}`}>
                {sector.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            
            <div className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-inactive-light dark:bg-inactive-dark px-3">
              <span className="material-symbols-outlined text-base">
                {sector.isAuto ? 'robot_2' : 'pan_tool_alt'}
              </span>
              <p className="text-sm font-medium leading-normal">
                {sector.isAuto ? 'Auto' : 'Manual'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="shrink-0" onClick={handleToggle}>
          <label 
            className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 ${
              sector.isActive 
                ? 'bg-primary' 
                : 'bg-inactive-light dark:bg-inactive-dark'
            }`}
          >
            <input 
              type="checkbox" 
              className="invisible absolute"
              checked={sector.isActive}
              onChange={() => {}}
            />
            <div 
              className="h-[27px] w-[27px] rounded-full bg-white transition-transform duration-200 ease-in-out"
              style={{ 
                transform: sector.isActive ? 'translateX(20px)' : 'translateX(0px)',
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px'
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
