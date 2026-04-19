import { useEventProgress, useStages } from '@/lib/queries';
import type { StageStatus } from '@/lib/types';

const cellClass = (status: StageStatus | undefined) => {
  if (status === 'done') return 'bg-emerald-500';
  if (status === 'in_progress')
    return 'bg-[repeating-linear-gradient(45deg,#fde68a,#fde68a_4px,#fcd34d_4px,#fcd34d_8px)]';
  return 'bg-slate-100';
};

const cellLabel = (status: StageStatus | undefined) => {
  if (status === 'done') return '✓';
  if (status === 'in_progress') return '•';
  return '';
};

export function ProgressMatrix({ eventId }: { eventId: string }) {
  const { data: stages = [], isLoading: stagesLoading } = useStages(eventId);
  const { data: progress = [], isLoading: progressLoading } = useEventProgress(eventId);

  if (stagesLoading || progressLoading) {
    return <p className="text-slate-500 text-sm">Загрузка…</p>;
  }

  if (stages.length === 0) {
    return <p className="text-slate-500 text-sm">Сначала добавьте этапы на вкладке «Этапы»</p>;
  }
  if (progress.length === 0) {
    return <p className="text-slate-500 text-sm">Команд пока нет</p>;
  }

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  const totals = sortedStages.map((stage) => {
    let done = 0;
    let inProgress = 0;
    for (const row of progress) {
      const item = row.items.find((it) => it.stage_id === stage.id);
      if (item?.status === 'done') done++;
      else if (item?.status === 'in_progress') inProgress++;
    }
    return { done, inProgress };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Прогресс по этапам</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> готово
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-[repeating-linear-gradient(45deg,#fde68a,#fde68a_3px,#fcd34d_3px,#fcd34d_6px)]" />
            в процессе
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" />
            не начато
          </span>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide sticky left-0 bg-slate-50">
                Команда
              </th>
              {sortedStages.map((stage) => (
                <th
                  key={stage.id}
                  className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[5rem]"
                >
                  {stage.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {progress.map((row) => (
              <tr key={row.team_id} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-2 font-medium text-slate-900 text-sm sticky left-0 bg-white">
                  {row.team_name}
                </td>
                {sortedStages.map((stage) => {
                  const item = row.items.find((it) => it.stage_id === stage.id);
                  return (
                    <td key={stage.id} className="px-2 py-2">
                      <div
                        className={
                          'h-8 rounded-md flex items-center justify-center text-white text-sm font-bold ' +
                          cellClass(item?.status)
                        }
                        title={`${stage.name}: ${item?.status ?? 'pending'}`}
                      >
                        {cellLabel(item?.status)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-slate-50 border-t border-slate-200">
              <td className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide sticky left-0 bg-slate-50">
                Итого
              </td>
              {totals.map((t, i) => (
                <td key={sortedStages[i].id} className="px-2 py-2 text-center">
                  <div className="text-xs text-slate-600 tabular-nums">
                    <span className="font-semibold text-emerald-700">{t.done}</span>
                    {t.inProgress > 0 && (
                      <span className="text-amber-700"> +{t.inProgress}</span>
                    )}
                    <span className="text-slate-400"> / {progress.length}</span>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
