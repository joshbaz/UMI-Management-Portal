import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiUserLine, RiLogoutBoxRLine } from 'react-icons/ri';
import { useAuth } from '../../store/context/AuthContext';
import logo2 from '../../assets/logo2.png';
import NavigationMenu from '../Navigation/NavigationMenu';
import { HiOutlineAcademicCap, HiOutlineUserGroup } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { useGetLoggedInUserDetails } from '../../store/tanstackStore/services/queries';
const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { data } = useGetLoggedInUserDetails();


  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-[252px] min-h-screen border-r border-[#E5E7EB] flex flex-col bg-white">
      {/* Logo Section */}
      <div className="py-4 px-4 border-b border-[#E5E7EB] flex items-center">
        <img src={logo2} alt="UMI Logo" className="h-14 w-64" />
      </div>

      {/* Profile Section */}
      <div className="h-[56px] py-3 px-4 border-b border-[#E5E7EB] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <RiUserLine className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700">
            {data?.user?.name}
          </p>
          <p className="text-xs font-medium text-gray-500">
            {data?.user?.designation}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <NavigationMenu>
          {/* Schools Management */}
          <NavLink
            to={ROUTES.SCHOOLS.ROOT}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-2 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 transform ${
                isActive ? 'bg-gray-100 text-gray-700' : ''
              }`
            }
          >
            <HiOutlineAcademicCap className="w-5 h-5" />
            <span className="mx-4 font-medium">Schools Management</span>
          </NavLink>

          {/* User Roles Management */}
          <NavLink
            to={ROUTES.SUPERVISOR.ROOT}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-2 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 transform ${
                isActive ? 'bg-gray-100 text-gray-700' : ''
              }`
            }
          >
            <HiOutlineUserGroup className="w-5 h-5" />
            <span className="mx-4 font-medium">User Roles Management</span>
          </NavLink>
        </NavigationMenu>
      </div>

      {/* Logout Section */}
      <div className="h-[72px] p-4 border-t border-[#E5E7EB]">
        <button
          onClick={handleLogout}
          className="flex items-center justify-between gap-3 px-4 py-2 rounded-md w-full text-[#070B1D] hover:bg-[#ECF6FB]"
        >
          <span className="text-xs font-roboto font-medium text-red-700">Logout</span>
          <span className="w-9 h-7 p-2 border border-red-700 bg-red-100 !rounded-md flex items-center justify-center">
            <RiLogoutBoxRLine className="w-5 h-5 text-red-700" />
          </span>         
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
