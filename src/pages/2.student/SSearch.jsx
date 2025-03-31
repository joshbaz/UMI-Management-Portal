import { Search } from "lucide-react";

const SSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-[600px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="Search by Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
};

export default SSearch;
