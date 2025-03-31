/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';
import { RiArrowLeftLine } from 'react-icons/ri';

const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = false,
  actionButton = null,
  lastLogin = null 
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-md text-[#23388F] hover:bg-[#ECF6FB]"
            >
              <RiArrowLeftLine className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-[#070B1D]">{title}</h1>
            {subtitle && (
              <p className="text-sm text-[#939495] mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastLogin && (
            <p className="text-sm text-[#939495]">
              Last login: {lastLogin}
            </p>
          )}
          {actionButton}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
