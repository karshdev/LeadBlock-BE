import { Search } from 'lucide-react';
import { Input } from '../common/Input';

interface LeadFiltersProps {
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  leadCount: number;
}

export const LeadFilters = ({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  leadCount,
}: LeadFiltersProps): JSX.Element => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  statusFilter === status
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600 ml-4">
            Showing <span className="font-semibold text-gray-900">{leadCount}</span> leads
          </div>
        </div>
      </div>
    </div>
  );
};

