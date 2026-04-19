import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMyTeam, useTeamProgress } from '@/lib/queries';
import { setStageStatus } from '@/lib/mutations';
import type { StageStatus } from '@/lib/types';

const NEXT: Record<StageStatus, StageStatus> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
};

const LABEL: Record<StageStatus, string> = {
  pending: 'Не начат',
  in_progress: 'В работе',
  done: 'Готово',
};

const statusBadge: Record<StageStatus, string> = {
  pending: 'bg-slate-100 text-slate-500',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
};

export default function TeamProgressPage() {
  const { data: team } = useMyTeam();
  const { data: progress } = useTeamProgress(team?.id);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: ({ stageId, status }: { stageId: string; status: StageStatus }) =>
      setStageStatus(team!.id, stageId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progress', 'team', team?.id] }),
  });

  if (!team) {
    return (
      <div className="max-w-xl mx-auto mt-8">
        <p className="text-slate-600">У вас пока нет команды. Обратитесь к администратору.</p>
      </div>
    );
  }
  if (!progress) return <p className="text-slate-500">Загружаем…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{team.name}</h1>
        <p className="text-slate-500 text-sm mt-1">Прогресс по этапам</p>
      </div>

      <ol className="space-y-3">
        {progress.items.map((it) => (
          <li
            key={it.stage_id}
            className="flex items-center justify-between bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-4"
          >
            <div>
              <p className="font-medium text-slate-900">{it.stage_name}</p>
              <span
                className={
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ' +
                  statusBadge[it.status]
                }
              >
                {LABEL[it.status]}
              </span>
            </div>
            <button
              onClick={() => mut.mutate({ stageId: it.stage_id, status: NEXT[it.status] })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              → {LABEL[NEXT[it.status]]}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
