import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLogout } from '@/lib/mutations';

export function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold text-slate-900">
            Judging Platform
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {user?.role === 'admin' && (
              <Link to="/admin/events" className="text-slate-700 hover:text-slate-900">
                События
              </Link>
            )}
            {user?.role === 'judge' && (
              <Link to="/judge" className="text-slate-700 hover:text-slate-900">
                Оценивание
              </Link>
            )}
            {user ? (
              <>
                <span className="text-slate-500">{user.name} · {user.role}</span>
                <button
                  className="text-slate-700 hover:text-slate-900"
                  onClick={async () => {
                    await logout.mutateAsync();
                    navigate('/login');
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <Link to="/login" className="text-slate-700 hover:text-slate-900">
                Войти
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
