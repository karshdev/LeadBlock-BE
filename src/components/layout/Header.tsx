import { Plus, LogOut, User } from 'lucide-react';
import { Button } from '../common/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onAddLead: () => void;
}

export const Header = ({ onAddLead }: HeaderProps): JSX.Element => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LeadBlocks
            </h1>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded">
              Lead Management
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <User size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user.username}</span>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                  {user.role}
                </span>
              </div>
            )}
            <Button onClick={onAddLead} variant="primary" className='flex items-center'>
              <Plus size={20} className="mr-2" />
              Add Lead
            </Button>
            <Button onClick={handleLogout} variant="secondary" className="!px-3">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

