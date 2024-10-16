import { Checkbox } from 'antd';
import { FilterControlsProps } from '../../types';

export default function FilterControls({
  sortOrder,
  showNotBegun,
  showActive,
  toggleSortOrder,
  setShowNotBegun,
  setShowActive
}: FilterControlsProps): JSX.Element {
  return (
    <div className="mb-4">
      {/* Sort order toggle button */}
      <button 
        onClick={toggleSortOrder}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
      >
        Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
      </button>

      {/* Checkbox for filtering vacations that have not begun */}
      <Checkbox 
        checked={showNotBegun}
        onChange={e => setShowNotBegun(e.target.checked)}
      >
        Show only vacations that have not begun
      </Checkbox>

      {/* Checkbox for filtering currently active vacations */}
      <Checkbox 
        checked={showActive}
        onChange={e => setShowActive(e.target.checked)}
      >
        Show only currently active vacations
      </Checkbox>
    </div>
  );
}