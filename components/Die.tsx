import React from 'react';

interface DieProps {
  value: number;
  isRolling: boolean;
  className?: string;
}

const Die: React.FC<DieProps> = ({ value, isRolling, className = '' }) => {
  // Mapping of die values to pip positions (grid-area based or flex)
  // Using a 3x3 grid approach
  /*
    [0,0] [0,1] [0,2]
    [1,0] [1,1] [1,2]
    [2,0] [2,1] [2,2]
  */
  
  const getPips = (val: number) => {
    switch(val) {
      case 1: return [<div key="c" className="bg-current w-3 h-3 rounded-full col-start-2 row-start-2 shadow-inner" />];
      case 2: return [
        <div key="tl" className="bg-current w-3 h-3 rounded-full col-start-1 row-start-1 shadow-inner" />,
        <div key="br" className="bg-current w-3 h-3 rounded-full col-start-3 row-start-3 shadow-inner" />
      ];
      case 3: return [
        <div key="tl" className="bg-current w-3 h-3 rounded-full col-start-1 row-start-1 shadow-inner" />,
        <div key="c" className="bg-current w-3 h-3 rounded-full col-start-2 row-start-2 shadow-inner" />,
        <div key="br" className="bg-current w-3 h-3 rounded-full col-start-3 row-start-3 shadow-inner" />
      ];
      case 4: return [
        <div key="tl" className="bg-current w-3 h-3 rounded-full col-start-1 row-start-1 shadow-inner" />,
        <div key="tr" className="bg-current w-3 h-3 rounded-full col-start-3 row-start-1 shadow-inner" />,
        <div key="bl" className="bg-current w-3 h-3 rounded-full col-start-1 row-start-3 shadow-inner" />,
        <div key="br" className="bg-current w-3 h-3 rounded-full col-start-3 row-start-3 shadow-inner" />
      ];
      case 5: return [
        <div key="tl" className="bg-current w-3 h-3 rounded-full col-start-1 row-start-1 shadow-inner" />,
        <div key="tr" className="bg-current w-3 h-3 rounded-full col-start-3 row-start-1 shadow-inner" />,
        <div key="c" className="bg-current w-3 h-3 rounded-full col-start-2 row-start-2 shadow-inner" />,
        <div key="bl" className="bg-current w-3 h-3 rounded-full col-start-1 row-start-3 shadow-inner" />,
        <div key="br" className="bg-current w-3 h-3 rounded-full col-start-3 row-start-3 shadow-inner" />
      ];
      case 6: return [
        <div key="tl" className="bg-current w-3 h-3 rounded-full col-start-1 row-start-1 shadow-inner" />,
        <div key="tr" className="bg-current w-3 h-3 rounded-full col-start-3 row-start-1 shadow-inner" />,
        <div key="ml" className="bg-current w-3 h-3 rounded-full col-start-1 row-start-2 shadow-inner" />,
        <div key="mr" className="bg-current w-3 h-3 rounded-full col-start-3 row-start-2 shadow-inner" />,
        <div key="bl" className="bg-current w-3 h-3 rounded-full col-start-1 row-start-3 shadow-inner" />,
        <div key="br" className="bg-current w-3 h-3 rounded-full col-start-3 row-start-3 shadow-inner" />
      ];
      default: return [];
    }
  };

  return (
    <div className={`
      relative w-24 h-24 bg-gray-100 rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.3)] 
      flex items-center justify-center 
      ${isRolling ? 'rolling' : ''} 
      ${className}
    `}>
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-16 h-16 text-gray-900">
        {getPips(value)}
      </div>
    </div>
  );
};

export default Die;
