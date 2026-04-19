import { Link } from 'react-router-dom';
import { useEventProgress, useEvents, useTeams } from '@/lib/queries';
import { StageProgressBar } from '@/components/StageProgressBar';

export default function JudgeTeamsPage() {
  const { data: events = [] } = useEvents();
  const activeEvent = events[0];
  const { data: teams = [], isLoading } = useTeams(activeEvent?.id);
  const { data: progress = [] } = useEventProgress(activeEvent?.id);
  const progressByTeam = Object.fromEntries(progress.map((row) => [row.team_id, row.items]));

  if (!activeEvent) {
    return <p className="text-slate-500">Нет активных событий</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{activeEvent.name}</h1>
        <p className="text-slate-500 text-sm mt-1">Команды на оценке</p>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Загрузка…</p>
      ) : teams.length === 0 ? (
        <p className="text-slate-500">Команд пока нет</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Команда
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Трек
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Прогресс
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/judge/teams/${t.id}`}
                      className="font-medium text-slate-900 hover:text-emerald-700 transition-colors"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{t.track ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StageProgressBar items={progressByTeam[t.id] ?? []} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/judge/teams/${t.id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Оценить
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
