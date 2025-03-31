import React, { useMemo } from 'react';
import { schoolData } from './SchoolData';

const SchoolTableTab = ({ selectedCampus, setSelectedCampus, schools = [] }) => {
  // Get unique campuses and count schools in each campus using useMemo
  const campusStats = useMemo(() => {
    const stats = schools.reduce((acc, school) => {
      const campusName = school.campus?.name || 'Uncategorized';
      acc[campusName] = (acc[campusName] || 0) + 1;
      return acc;
    }, {});

    // Add "All Campuses" to the stats
    stats['All Campuses'] = schools.length;
    
    return stats;
  }, [schools]);

  // Get unique campus names and create tabs dynamically
  const tabs = useMemo(() => {
    const uniqueTabs = [
      { name: 'All Campuses', count: campusStats['All Campuses'] }
    ];

    // Add tabs for each unique campus
    schools.forEach(school => {
      const campusName = school.campus?.name;
      if (campusName && !uniqueTabs.some(tab => tab.name === campusName)) {
        uniqueTabs.push({
          name: campusName,
          count: campusStats[campusName] || 0
        });
      }
    });

    return uniqueTabs;
  }, [schools, campusStats]);

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setSelectedCampus(() => tab.name)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                selectedCampus === tab.name
                  ? 'border-[#23388F] text-[#23388F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.name}
            <span
              className={`
                ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
                ${
                  selectedCampus === tab.name
                    ? 'bg-[#EEF2FF] text-[#23388F]'
                    : 'bg-gray-100 text-gray-900'
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

export default SchoolTableTab;
