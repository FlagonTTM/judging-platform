import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLogout } from '@/lib/mutations';
import { useEvents } from '@/lib/queries';
import { EventTimer } from '@/components/EventTimer';

const navClass = ({ isActive }: { isActive: boolean }) =>
  'flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ' +
  (isActive
    ? 'bg-emerald-700 text-white font-medium'
    : 'text-emerald-100 hover:bg-emerald-800');

const roleLabel: Record<string, string> = {
  admin: 'Администратор',
  judge: 'Жюри',
  team: 'Команда',
};

export function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: events } = useEvents();
  const activeEvent = events?.[0];

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-56 bg-emerald-900 flex flex-col z-10">
        <div className="px-5 py-4 border-b border-emerald-800">
          <span className="text-emerald-400 font-bold text-lg tracking-tight">TulaHack</span>
          <span className="ml-1 text-emerald-600 text-sm">2026</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {user?.role === 'admin' && (
            <NavLink to="/admin/events" className={navClass}>
              События
            </NavLink>
          )}
          {user?.role === 'judge' && (
            <NavLink to="/judge" className={navClass}>
              Оценивание
            </NavLink>
          )}
          {user?.role === 'team' && (
            <>
              <NavLink to="/team/progress" className={navClass}>
                Прогресс
              </NavLink>
              <NavLink to="/team/submission" className={navClass}>
                Заявка
              </NavLink>
              <NavLink to="/team/results" className={navClass}>
                Результаты
              </NavLink>
            </>
          )}
          {!user && (
            <NavLink to="/" className={navClass}>
              Главная
            </NavLink>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-emerald-800">
          {user && activeEvent && (
            <div className="mb-3">
              <p className="text-xs text-emerald-500 mb-0.5">До дедлайна</p>
              <EventTimer deadline={activeEvent.deadline ?? activeEvent.end_at} />
            </div>
          )}
          {user ? (
            <>
              <p className="text-sm font-medium text-emerald-100 truncate">{user.name}</p>
              <p className="text-xs text-emerald-400 mb-3">{roleLabel[user.role] ?? user.role}</p>
              <button
                onClick={async () => {
                  await logout.mutateAsync();
                  navigate('/login');
                }}
                className="text-xs text-emerald-400 hover:text-emerald-200 transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="text-xs text-emerald-400 hover:text-emerald-200 transition-colors"
            >
              Войти
            </NavLink>
          )}
        </div>
      </aside>

      <main className="ml-56 flex-1 bg-slate-50 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  );
}
