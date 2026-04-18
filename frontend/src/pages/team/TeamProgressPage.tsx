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

export default function TeamProgressPage() {
  const { data: team } = useMyTeam();
  const { data: progress } = useTeamProgress(team?.id);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: ({ stageId, status }: { stageId: string; status: StageStatus }) =>
      setStageStatus(team!.id, stageId, status),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['progress', 'team', team?.id] }),
  });

  if (!team) {
    return (
      <div className="p-6 text-slate-600">
        У вас пока нет команды. Обратитесь к админу.
      </div>
    );
  }
  if (!progress) return <div className="p-6">Загружаем…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Прогресс — {team.name}</h1>
      <ol className="space-y-2">
        {progress.items.map((it) => (
          <li
            key={it.stage_id}
            className="flex items-center justify-between rounded border bg-white p-3"
          >
            <div>
              <div className="font-medium">{it.stage_name}</div>
              <div className="text-sm text-slate-500">{LABEL[it.status]}</div>
            </div>
            <button
              onClick={() =>
                mut.mutate({ stageId: it.stage_id, status: NEXT[it.status] })
              }
              className="rounded bg-slate-900 px-3 py-1 text-white text-sm"
            >
              → {LABEL[NEXT[it.status]]}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
