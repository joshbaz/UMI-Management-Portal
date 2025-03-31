import React from 'react';
import logo1 from '@/assets/logo1.png';
import logo2 from '@/assets/logo2.png';

/**
 * Logo component that can be rendered in different variants
 * @param {object} props
 * @param {'sidebar' | 'login'} [props.variant] - The variant of the logo to display
 * @returns {React.ReactElement}
 */
const Logo = ({ variant = 'sidebar' }) => {
  return (
    <div className="flex items-center">
      <img 
        src={variant === 'login' ? logo1 : logo2} 
        alt="UMI Logo" 
        className={`${
          variant === 'login' 
            ? 'h-16 w-auto mx-auto' 
            : 'h-10 w-auto'
        }`}
      />
    </div>
  );
};

export default Logo;