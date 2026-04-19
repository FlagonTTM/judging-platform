import type { TeamProgressItem } from '@/lib/types';

const colorByStatus: Record<string, string> = {
  done: 'bg-emerald-500',
  in_progress: 'bg-amber-400',
  pending: 'bg-slate-200',
};

export function StageProgressBar({ items }: { items: TeamProgressItem[] }) {
  if (items.length === 0) {
    return <div className="text-sm text-slate-400">Нет этапов</div>;
  }
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {[...items]
        .sort((a, b) => a.order - b.order)
        .map((it) => (
          <div
            key={it.stage_id}
            className="flex flex-col items-center gap-1"
            aria-label={`${it.stage_name}: ${it.status}`}
          >
            <div className={`h-2.5 w-12 rounded-full ${colorByStatus[it.status]}`} />
            <span className="text-xs text-slate-500" data-testid="stage-label">
              {it.stage_name}
            </span>
          </div>
        ))}
    </div>
  );
}
