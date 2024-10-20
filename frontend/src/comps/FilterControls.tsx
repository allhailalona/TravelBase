import { Radio } from 'antd';
import { FilterControlsProps } from '../../types';

export default function FilterControls({
  sortOrder,
  filterType,
  toggleSortOrder,
  setFilterType
}: FilterControlsProps): JSX.Element {
  return (
    <div className="mb-4">
      <button 
        onClick={toggleSortOrder}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
      >
        Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
      </button>

      <Radio.Group 
        value={filterType} 
        onChange={e => setFilterType(e.target.value)}
      >
        <Radio.Button value="all">All Vacations</Radio.Button>
        <Radio.Button value="notBegun">Not Begun</Radio.Button>
        <Radio.Button value="active">Currently Active</Radio.Button>
      </Radio.Group>
    </div>
  );
}