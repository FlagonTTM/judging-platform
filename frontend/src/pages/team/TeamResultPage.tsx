import { useMyTeam, useMyTeamResult } from '@/lib/queries';

export default function TeamResultPage() {
  const { data: team, isLoading: teamLoading } = useMyTeam();
  const { data: result, isLoading: resultLoading } = useMyTeamResult(team?.id);

  if (teamLoading || resultLoading) {
    return <div className="p-6 text-slate-500">Загружаем…</div>;
  }

  if (!team) {
    return (
      <div className="p-6">
        <p className="text-slate-500">У вас пока нет команды. Обратитесь к администратору.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-6 max-w-xl">
        <h1 className="text-2xl font-semibold mb-2">{team.name}</h1>
        <div className="rounded border bg-amber-50 border-amber-200 px-4 py-3 text-amber-800">
          Результаты ещё не опубликованы. Следите за объявлением организаторов.
        </div>
      </div>
    );
  }

  const score = parseFloat(result.final_score).toFixed(2);

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">{result.team_name} — Результаты</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center shadow-sm">
          <div className="text-4xl font-bold text-blue-600">#{result.rank}</div>
          <div className="mt-1 text-sm text-slate-500">Место</div>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center shadow-sm">
          <div className="text-4xl font-bold text-emerald-600">{score}</div>
          <div className="mt-1 text-sm text-slate-500">Итоговый балл</div>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center shadow-sm">
          <div className="text-4xl font-bold text-slate-700">{result.judges_count}</div>
          <div className="mt-1 text-sm text-slate-500">Судей оценило</div>
        </div>
      </div>

      {result.judges_count === 0 && (
        <div className="rounded border bg-slate-50 px-4 py-3 text-slate-600 text-sm">
          Ни один судья ещё не выставил финальные оценки.
        </div>
      )}
    </div>
  );
}
