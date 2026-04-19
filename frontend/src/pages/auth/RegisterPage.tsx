import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '@/lib/mutations';
import type { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('team');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await register.mutateAsync({ email, password, name, role });
      if (user.role === 'admin') navigate('/admin/events');
      else if (user.role === 'judge') navigate('/judge');
      else navigate('/team/progress');
    } catch {
      setError('Не удалось зарегистрироваться');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-emerald-600 font-bold text-2xl tracking-tight">TulaHack</span>
          <p className="text-slate-500 text-sm mt-1">Создание аккаунта</p>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Регистрация</h2>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Имя</label>
            <input
              required
              autoFocus
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
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
              minLength={8}
              placeholder="Минимум 8 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Роль</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="team">Команда</option>
              <option value="judge">Жюри</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={register.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50"
          >
            {register.isPending ? 'Создаём…' : 'Создать аккаунт'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500 text-center">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
