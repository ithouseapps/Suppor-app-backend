import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import InstallBanner from '../../components/InstallBanner';

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-sm">
      <header className="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl font-bold text-slate-800">IT House</h1>
          <p className="text-xs text-slate-400">Student</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800">{user?.first_name || user?.username}</p>
            <p className="text-xs text-slate-400">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Chiqish
          </button>
        </div>
      </header>

      <InstallBanner />
      <main className="flex-1 px-4 pt-4 pb-24 overflow-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-slate-200/60 px-4 py-2 z-10">
        <div className="flex items-center justify-around">
          {[
            { to: '/student', end: true, label: 'Bron', icon: ClockIcon },
            { to: '/student/history', label: 'Tarix', icon: HistoryIcon },
          ].map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-xl transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <tab.icon />
              <span className="text-xs font-medium">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
