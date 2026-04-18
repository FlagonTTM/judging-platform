import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
      else navigate('/');
    } catch {
      setError('Не удалось зарегистрироваться');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h2 className="text-2xl font-semibold mb-6">Регистрация</h2>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          required
          autoFocus
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Пароль (от 8 символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="team">Команда</option>
          <option value="judge">Жюри</option>
          <option value="admin">Администратор</option>
        </select>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={register.isPending}
          className="w-full bg-slate-800 text-white rounded py-2 disabled:opacity-50"
        >
          {register.isPending ? 'Создаём…' : 'Создать аккаунт'}
        </button>
      </form>
    </div>
  );
}
