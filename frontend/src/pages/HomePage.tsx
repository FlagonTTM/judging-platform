import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthContext';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p className="text-slate-500">Загрузка…</p>;
  if (user?.role === 'admin') return <Navigate to="/admin/events" replace />;
  if (user?.role === 'judge') return <Navigate to="/judge" replace />;

  return (
    <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
      <div>
        <span className="text-emerald-600 font-bold text-4xl tracking-tight">TulaHack</span>
        <span className="text-slate-400 font-bold text-4xl ml-2">2026</span>
      </div>
      <p className="text-slate-600 text-lg">
        Платформа для оценки проектов хакатона: критерии, оценки жюри, рейтинг
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          to="/login"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-6 py-2.5 font-medium transition-colors"
        >
          Войти
        </Link>
        <Link
          to="/register"
          className="border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg px-6 py-2.5 font-medium transition-colors"
        >
          Регистрация
        </Link>
      </div>
    </div>
  );
}
