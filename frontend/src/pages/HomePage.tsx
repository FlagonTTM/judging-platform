import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthContext';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p className="text-slate-500">Загрузка…</p>;
  if (user?.role === 'admin') return <Navigate to="/admin/events" replace />;
  if (user?.role === 'judge') return <Navigate to="/judge" replace />;

  return (
    <div className="max-w-xl mt-12 mx-auto text-center space-y-4">
      <h1 className="text-3xl font-semibold">Judging Platform</h1>
      <p className="text-slate-600">
        Платформа для оценки проектов хакатона: критерии, оценки жюри, рейтинг
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          to="/login"
          className="bg-slate-800 text-white rounded px-5 py-2"
        >
          Войти
        </Link>
        <Link to="/register" className="border border-slate-300 rounded px-5 py-2">
          Регистрация
        </Link>
      </div>
    </div>
  );
}
