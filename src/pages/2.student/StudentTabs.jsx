const StudentTabs = ({ selectedCategory, setSelectedCategory, students = [] }) => {
    // Get unique program levels from students and add "All Students" at the start
    const categories = ["All Students", ...new Set(students.map(student => student.programLevel))].filter(Boolean);
  
    const getCategoryCount = (category) => {
      if (!students) return 0;
      if (category === "All Students") return students.length;
      return students.filter(student => student.programLevel === category).length;
    };

    return (
      <div className="relative border-b">
        <div className="flex space-x-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`relative px-3 py-2 text-sm transition-colors duration-300 capitalize ${
                selectedCategory === category
                  ? "text-[#23388F] font-semibold after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#23388F]"
                  : "text-gray-600 hover:text-gray-900 hover:after:absolute hover:after:left-0 hover:after:bottom-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-gray-400"
              }`}
            >
              {category} ({getCategoryCount(category)})
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  export default StudentTabs;
  