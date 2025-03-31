import SStatsToolTip from "./SStatsToolTip.jsx";

const SStats = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md">
        <p className="mt-2 text-3xl font-semibold">100,000</p>
        <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
      </div>

      <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md">
        <p className="mt-2 text-3xl font-semibold">45</p>
        <h3 className="text-sm font-medium text-gray-500">Active Students</h3>
      </div>

      <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md">
        <p className="mt-2 text-3xl font-semibold">14</p>
        <h3 className="text-sm font-medium text-gray-500">
          <div className="flex items-center gap-1">
            Status: Workshop
            <SStatsToolTip text="Workshop" />
          </div>
        </h3>
      </div>

      <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md">
        <p className="mt-2 text-3xl font-semibold">26</p>
        <h3 className="text-sm font-medium text-gray-500">
          <div className="flex items-center gap-1">
            Status: Normal Progress
            <SStatsToolTip text="Normal Progress" />
          </div>
        </h3>
      </div>
    </div>
  );
};

export default SStats;
