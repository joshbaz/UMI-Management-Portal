import { useState } from 'react';
import { IoMdInformationCircle } from "react-icons/io";

const SToolTip = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        <IoMdInformationCircle className="w-4 h-4 text-[#939495]" />
      </div>
      {isVisible && (
        <div 
          className="absolute z-50 px-3 py-2 text-xs text-white bg-gray-800 rounded shadow-lg"
          style={{
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-4px)',
            whiteSpace: 'nowrap'
          }}
        >
          {text}
          <div 
            className="absolute w-0 h-0"
            style={{
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #1f2937'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SToolTip; 