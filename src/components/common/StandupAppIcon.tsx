import React from 'react';

interface StandupAppIconProps {
  size?: number | string;
  className?: string;
  showGlow?: boolean;
}

export const StandupAppIcon: React.FC<StandupAppIconProps> = ({
  size = 40,
  className = '',
  showGlow = true
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {showGlow && (
        <div 
          className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-purple-600/30 via-pink-500/20 to-amber-500/30 blur-sm pointer-events-none" 
        />
      )}
      <img
        src="/app-icon.svg"
        alt="StandupLab App Icon"
        className="w-full h-full object-contain rounded-2xl shadow-lg relative z-10 hover:scale-105 transition-transform duration-300"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
