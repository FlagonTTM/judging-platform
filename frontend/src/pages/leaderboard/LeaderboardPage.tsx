import { useParams } from 'react-router-dom';
import { useEvent, useLeaderboard } from '@/lib/queries';

export default function LeaderboardPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: event } = useEvent(id);
  const { data: rows = [], error, isLoading } = useLeaderboard(id);

  if (isLoading) return <p className="text-slate-500">Загрузка…</p>;
  if (error) {
    return (
      <div className="max-w-md mt-12 mx-auto text-center">
        <h2 className="text-xl font-semibold mb-2">Рейтинг ещё закрыт</h2>
        <p className="text-slate-500 text-sm">
          Организаторы пока не открыли публичный leaderboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold">{event?.name ?? 'Рейтинг'}</h2>
        <p className="text-sm text-slate-500">
          Обновляется автоматически каждые 10 секунд
        </p>
      </div>

      <table className="w-full bg-white border rounded overflow-hidden">
        <thead className="bg-slate-100 text-sm text-slate-600">
          <tr>
            <th className="px-4 py-2 text-left w-12">#</th>
            <th className="px-4 py-2 text-left">Команда</th>
            <th className="px-4 py-2 text-right w-32">Балл</th>
            <th className="px-4 py-2 text-right w-32">Жюри</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                Пока нет оценок
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.team_id} className="border-t">
                <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{row.team_name}</td>
                <td className="px-4 py-3 text-right font-mono">{row.final_score}</td>
                <td className="px-4 py-3 text-right text-slate-500">{row.judges_count}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
