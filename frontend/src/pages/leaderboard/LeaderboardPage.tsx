import { useParams } from 'react-router-dom';
import { useEvent, useLeaderboard } from '@/lib/queries';

const rankBadge = (i: number) => {
  if (i === 0) return 'bg-amber-100 text-amber-700';
  if (i === 1) return 'bg-slate-100 text-slate-600';
  if (i === 2) return 'bg-orange-100 text-orange-700';
  return 'bg-slate-50 text-slate-500';
};

export default function LeaderboardPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: event } = useEvent(id);
  const { data: rows = [], error, isLoading } = useLeaderboard(id);

  if (isLoading) return <p className="text-slate-500">Загрузка…</p>;

  if (error) {
    return (
      <div className="max-w-md mt-16 mx-auto text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Рейтинг ещё закрыт</h2>
        <p className="text-slate-500 text-sm">
          Организаторы пока не открыли публичный leaderboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{event?.name ?? 'Рейтинг'}</h1>
        <p className="text-sm text-slate-500 mt-1">Обновляется каждые 10 секунд</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">
                Место
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Команда
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">
                Балл
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">
                Судей
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500 text-sm">
                  Пока нет оценок
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.team_id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ' +
                        rankBadge(i)
                      }
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.team_name}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-700">
                    {row.final_score}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-500">{row.judges_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
