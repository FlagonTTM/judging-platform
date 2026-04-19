import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '@/lib/mutations';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login.mutateAsync({ email, password });
      const from = (location.state as { from?: string } | null)?.from;
      const home =
        user.role === 'admin'
          ? '/admin/events'
          : user.role === 'judge'
            ? '/judge'
            : '/team/progress';
      const canUseFrom =
        from &&
        (user.role === 'admin' ||
          (user.role === 'judge' && from.startsWith('/judge')) ||
          (user.role === 'team' && from.startsWith('/team')));
      navigate(canUseFrom ? from! : home);
    } catch {
      setError('Неверные email или пароль');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-emerald-600 font-bold text-2xl tracking-tight">TulaHack</span>
          <p className="text-slate-500 text-sm mt-1">Платформа оценки хакатона</p>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Вход в систему</h2>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50"
          >
            {login.isPending ? 'Входим…' : 'Войти'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500 text-center">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
