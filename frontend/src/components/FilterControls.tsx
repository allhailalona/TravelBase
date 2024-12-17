import { Radio } from "antd";
import { FilterControlsProps } from "../../types";

export default function FilterControls({
  sortOrder,
  filterType,
  toggleSortOrder,
  setFilterType,
}: FilterControlsProps): JSX.Element {
  return (
    <div className="mb-4 flex justify-between items-center">
      <button
        onClick={toggleSortOrder}
        className="px-4 mt-4 h-10 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
      >
        Sort by Date {sortOrder === "asc" ? "↑" : "↓"}
      </button>

      <Radio.Group
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="h-10 flex flex-row mt-4"
      >
        <Radio.Button value="all" className="h-full flex items-center">
          All Vacations
        </Radio.Button>
        <Radio.Button value="notBegun" className="h-full flex items-center">
          Not Begun
        </Radio.Button>
        <Radio.Button value="active" className="h-full flex items-center">
          Currently Active
        </Radio.Button>
        <Radio.Button value="followed" className="h-full flex items-center">
          Followed Vacations
        </Radio.Button>
      </Radio.Group>
    </div>
  );
}
