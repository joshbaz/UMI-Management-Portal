import SStatsToolTip from "./SStatsToolTip.jsx";
import { Icon } from "@iconify-icon/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SStats = ({ stats }) => {
  const isLoading = !stats;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        ) : (
          <>
            <p className="mt-2 text-3xl font-semibold">{stats?.totalStudents || "0"}</p>
            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
          </>
        )}
      </div>

      <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        ) : (
          <>
            <p className="mt-2 text-3xl font-semibold">{stats?.ongoingStudents || "0"}</p>
            <h3 className="text-sm font-medium text-gray-500">Ongoing Students</h3>
          </>
        )}
      </div>

      <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        ) : (
          <>
            <p className="mt-2 text-3xl font-semibold">{stats?.normalProgress || "0"}</p>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
              Normal Progress
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icon
                      icon="tdesign:info-circle-filled"
                      className="w-4 h-4 text-gray-400"
                    />
                  </TooltipTrigger>
                  <TooltipContent>Students currently in normal progress</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
          </>
        )}
      </div>

      <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        ) : (
          <>
            <p className="mt-2 text-3xl font-semibold">{stats?.underExamination || "0"}</p>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
              Under Examination
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icon
                      icon="tdesign:info-circle-filled"
                      className="w-4 h-4 text-gray-400"
                    />
                  </TooltipTrigger>
                  <TooltipContent>Students currently under examination</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
          </>
        )}
      </div>
    </div>
  );
};

export default SStats;
