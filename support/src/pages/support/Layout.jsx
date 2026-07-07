import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth';

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const mainTabs = [
  { to: '/support', label: 'Dashboard', icon: DashboardIcon },
  { to: '/support/history', label: 'Tarix', icon: HistoryIcon },
  { to: '/support/profile', label: 'Profil', icon: ProfileIcon },
];

export default function SupportLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = (user?.first_name || user?.username)?.[0]?.toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-xl">
      <header className="bg-white px-5 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">IT House</h1>
            <p className="text-[10px] text-slate-400 leading-tight">Support</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {initial}
          </div>
          <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors" title="Chiqish">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-20 overflow-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white z-10 shadow-[0_-2px_16px_rgba(0,0,0,0.06)] rounded-t-xl">
        <div className="flex items-stretch px-2 py-1">
          {mainTabs.map((tab) => {
            const active = tab.to === '/support'
              ? (location.pathname === '/support' && !location.search.includes('section='))
              : location.pathname.startsWith(tab.to);
            return (
              <button key={tab.to} onClick={() => navigate(tab.to)}
                className={`flex flex-col items-center justify-center gap-0 py-2 transition-all flex-1 relative ${
                  active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}>
                <tab.icon />
                <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
                {active && <span className="w-1 h-1 bg-blue-600 rounded-full mt-1" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
