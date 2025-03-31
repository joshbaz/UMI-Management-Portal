import React, { useMemo } from "react";

const FacultyTableTab = ({ selectedStaff, setSelectedStaff, facultyData }) => {
     // Get unique campuses and count schools in each campus using useMemo
  const staffStats = useMemo(() => {
    const stats = facultyData.reduce((acc, faculty) => {
      const staffType = faculty.facultyType || 'Uncategorized';
      acc[staffType] = (acc[staffType] || 0) + 1;
      return acc;
    }, {});

    // Add "All Campuses" to the stats
    stats['All Staff'] = facultyData.length;
    
    return stats;
  }, [facultyData]);

  // Get unique campus names and create tabs dynamically
  const tabs = useMemo(() => {
    const uniqueTabs = [
      { name: 'All Staff', count: staffStats['All Staff'] }
    ];

    // Add tabs for each unique campus
    facultyData.forEach(faculty => {
      const staffType = faculty.facultyType;
      if (staffType && !uniqueTabs.some(tab => tab.name === staffType)) {
        uniqueTabs.push({
          name: staffType,
          count: staffStats[staffType] || 0
        });
      }
    });

    return uniqueTabs;
  }, [facultyData, staffStats]);
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setSelectedStaff(() => tab.name)}
            className={`
          whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
          ${
            selectedStaff === tab.name
              ? "border-[#23388F] text-[#23388F]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }
        `}
          >
            {tab.name}
            <span
              className={`
            ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
            ${
              selectedStaff === tab.name
                ? "bg-[#EEF2FF] text-[#23388F]"
                : "bg-gray-100 text-gray-900"
            }
          `}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default FacultyTableTab;
