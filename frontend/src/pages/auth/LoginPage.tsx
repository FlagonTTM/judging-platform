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
      if (from) navigate(from);
      else if (user.role === 'admin') navigate('/admin/events');
      else if (user.role === 'judge') navigate('/judge');
      else navigate('/');
    } catch {
      setError('Неверные email или пароль');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h2 className="text-2xl font-semibold mb-6">Вход</h2>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          type="email"
          required
          autoFocus
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          required
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full bg-slate-800 text-white rounded py-2 disabled:opacity-50"
        >
          {login.isPending ? 'Входим…' : 'Войти'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Нет аккаунта?{' '}
        <Link to="/register" className="text-slate-900 underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
