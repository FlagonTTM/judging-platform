import { Link } from 'react-router-dom';
import { useEventProgress, useEvents, useTeams } from '@/lib/queries';
import { StageProgressBar } from '@/components/StageProgressBar';

export default function JudgeTeamsPage() {
  const { data: events = [] } = useEvents();
  const activeEvent = events[0];
  const { data: teams = [], isLoading } = useTeams(activeEvent?.id);
  const { data: progress = [] } = useEventProgress(activeEvent?.id);
  const progressByTeam = Object.fromEntries(
    progress.map((row) => [row.team_id, row.items]),
  );

  if (!activeEvent) {
    return <p className="text-slate-500">Нет активных событий</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{activeEvent.name} · команды на оценке</h2>
      {isLoading ? (
        <p className="text-slate-500">Загрузка…</p>
      ) : teams.length === 0 ? (
        <p className="text-slate-500">Команд пока нет</p>
      ) : (
        <ul className="divide-y border rounded bg-white">
          {teams.map((t) => (
            <li key={t.id} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Link
                  to={`/judge/teams/${t.id}`}
                  className="font-medium hover:underline"
                >
                  {t.name}
                </Link>
                <p className="text-sm text-slate-500">{t.track ?? 'без трека'}</p>
              </div>
              <div className="flex-1">
                <StageProgressBar items={progressByTeam[t.id] ?? []} />
              </div>
              <Link
                to={`/judge/teams/${t.id}`}
                className="text-sm text-slate-700 hover:text-slate-900"
              >
                Оценить →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
