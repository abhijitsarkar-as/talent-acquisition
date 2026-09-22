import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { NotificationBell } from './NotificationBell';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`;

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="mr-4 text-lg font-bold text-gray-900">Talent Acquisition</span>
          <NavLink to="/my-dashboard" className={linkClass}>
            My Dashboard
          </NavLink>
          <NavLink to="/team-dashboard" className={linkClass}>
            Team Dashboard
          </NavLink>
          <NavLink to="/requisitions" className={linkClass}>
            Requisitions
          </NavLink>
          <NavLink to="/candidates" className={linkClass}>
            Candidates
          </NavLink>
          <NavLink to="/templates" className={linkClass}>
            Templates
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/skill-taxonomy" className={linkClass}>
              Skill Taxonomy
            </NavLink>
          )}
          {user?.role === 'ADMIN' && (
            <NavLink to="/users" className={linkClass}>
              Users
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="text-sm text-gray-600">
            {user?.name} <span className="text-gray-400">({user?.role})</span>
          </span>
          <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-gray-800">
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
