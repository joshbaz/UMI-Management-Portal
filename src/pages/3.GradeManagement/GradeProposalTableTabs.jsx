import React, { useCallback, useMemo } from "react";
const GradeProposalTableTabs = ({ activeTab, setActiveTab }) => {
  const categories = useMemo(
    () => ["Reviewers", "Panelists"].filter(Boolean),
    []
  );
  const handleCategoryClick = useCallback(
    (category) => {
      setActiveTab(category);
    },
    [setActiveTab]
  );
  return (
    <div className="relative ">
      <div className="flex space-x-6 px-3 mt-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`text-base font-[Inter-Medium] border py-1 px-4 rounded-lg cursor-pointer select-none ${
              activeTab === category
                ? "border-secondary-800 bg-secondary-100  text-primary-800"
                : "border-secondary-700 bg-white text-secondary-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GradeProposalTableTabs;
