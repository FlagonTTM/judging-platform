import { useParams } from 'react-router-dom';
import { useEvent, useLeaderboard } from '@/lib/queries';

const medal = (i: number) => {
  if (i === 0) return '🥇';
  if (i === 1) return '🥈';
  if (i === 2) return '🥉';
  return null;
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

      {rows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-6 py-12 text-center text-slate-500 text-sm">
          Пока нет оценок
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const isLeader = i === 0;
            return (
              <div
                key={row.team_id}
                className={
                  'flex items-center gap-4 rounded-xl px-5 py-4 transition-colors ' +
                  (isLeader
                    ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-700'
                    : 'bg-white border border-slate-200 hover:border-slate-300')
                }
              >
                <div
                  className={
                    'flex items-center justify-center w-10 h-10 rounded-full font-bold tabular-nums ' +
                    (isLeader
                      ? 'bg-white/20 text-white text-base'
                      : 'bg-slate-100 text-slate-600 text-sm')
                  }
                >
                  {medal(i) ?? i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={
                      'font-semibold truncate ' + (isLeader ? 'text-white' : 'text-slate-900')
                    }
                  >
                    {row.team_name}
                  </p>
                  <p
                    className={
                      'text-xs mt-0.5 ' + (isLeader ? 'text-emerald-100' : 'text-slate-500')
                    }
                  >
                    судей: {row.judges_count}
                  </p>
                </div>
                <div
                  className={
                    'font-mono text-xl font-bold tabular-nums ' +
                    (isLeader ? 'text-white' : 'text-emerald-700')
                  }
                >
                  {row.final_score.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
