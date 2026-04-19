import { useMyTeam, useMyTeamResult } from '@/lib/queries';

export default function TeamResultPage() {
  const { data: team, isLoading: teamLoading } = useMyTeam();
  const { data: result, isLoading: resultLoading } = useMyTeamResult(team?.id);

  if (teamLoading || resultLoading) {
    return <p className="text-slate-500">Загружаем…</p>;
  }

  if (!team) {
    return (
      <p className="text-slate-500">У вас пока нет команды. Обратитесь к администратору.</p>
    );
  }

  if (!result) {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">{team.name}</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-amber-800 text-sm font-medium">
          Результаты ещё не опубликованы. Следите за объявлением организаторов.
        </div>
      </div>
    );
  }

  const score = result.final_score.toFixed(2);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{result.team_name}</h1>
        <p className="text-slate-500 text-sm mt-1">Итоговые результаты</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 text-center">
          <div className="text-4xl font-bold text-slate-900">#{result.rank}</div>
          <div className="mt-1 text-sm text-slate-500">Место</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 text-center">
          <div className="text-4xl font-bold text-emerald-600">{score}</div>
          <div className="mt-1 text-sm text-slate-500">Балл</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 text-center">
          <div className="text-4xl font-bold text-slate-700">{result.judges_count}</div>
          <div className="mt-1 text-sm text-slate-500">Судей</div>
        </div>
      </div>

      {result.judges_count === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-600 text-sm">
          Ни один судья ещё не выставил финальные оценки.
        </div>
      )}
    </div>
  );
}
