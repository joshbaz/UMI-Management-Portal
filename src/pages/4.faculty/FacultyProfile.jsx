/* eslint-disable react/prop-types */
import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { FiSearch } from "react-icons/fi";
import { HiArrowLeft } from "react-icons/hi";
import { HiOutlineClipboardCheck, HiOutlineCog } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";
import { useGetFaculty } from "../../store/tanstackStore/services/queries";
import Tasks from "./Tasks";
import FacultyAccountSettings from "./FacultyAccountSettings";

const SearchBar = ({ value, onChange, placeholder = "Search" }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <FiSearch className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
};

const FacultyProfile = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("settings");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: facultyData, isLoading, error } = useGetFaculty(id);


   // If loading, show loading state
   if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
      <div className="text-lg font-semibold text-gray-600">Loading faculty data...</div>
    </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-red-600">Error: {error.message}</div>
      </div>
    );
  }


  return (
    <div className="min-h-full">
      {/* Global Search */}
      <div className="p-6 pb-0 w-1/2">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search"
        />
      </div>

      {/* Horizontal Line */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Faculty Profile
        </h1>
        <div className="text-sm text-gray-500">
          Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}
        </div>
      </div>

      {/* Control Panel */}
      <div className="px-6 py-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg gap-2 hover:bg-primary-900"
              >
                <HiArrowLeft className="w-5 h-5" />
                Back
              </button>
              <span className="text-lg font-medium text-gray-900 capitalize">
                { facultyData?.facultyMember?.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* <button
                onClick={() => setActiveTab("tasks")}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium gap-2 text-semantic-text-primary border-2
                  ${
                    activeTab === "tasks"
                      ? "border-primary-500"
                      : "border-semantic-border-inactive"
                  }`}
              >
                <HiOutlineClipboardCheck className="w-5 h-5 text-semantic-text-primary" />
                Tasks
              </button> */}
              <button
                onClick={() => setActiveTab("settings")}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium gap-2 text-semantic-text-primary border-2
                  ${
                    activeTab === "settings"
                      ? "border-primary-500"
                      : "border-semantic-border-inactive"
                  }`}
              >
                 <iconify-icon icon="material-symbols-light:manufacturing-rounded" width="24" height="24"></iconify-icon>
                Account Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {/* {activeTab === "tasks" && <Tasks facultyData={facultyData?.facultyMember} />} */}
      {activeTab === "settings" && (
        <FacultyAccountSettings facultyData={facultyData?.facultyMember} />
      )}
    </div>
  );
};

export default FacultyProfile;
