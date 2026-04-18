import type { TeamProgressItem } from '@/lib/types';

const colorByStatus: Record<string, string> = {
  done: 'bg-green-500',
  in_progress: 'bg-yellow-400',
  pending: 'bg-gray-300',
};

export function StageProgressBar({ items }: { items: TeamProgressItem[] }) {
  if (items.length === 0) {
    return <div className="text-sm text-gray-500">Нет этапов</div>;
  }
  return (
    <div className="flex items-center gap-2">
      {[...items]
        .sort((a, b) => a.order - b.order)
        .map((it) => (
          <div
            key={it.stage_id}
            className="flex flex-col items-center gap-1"
            aria-label={`${it.stage_name}: ${it.status}`}
          >
            <div className={`h-3 w-12 rounded ${colorByStatus[it.status]}`} />
            <span className="text-xs text-gray-700" data-testid="stage-label">
              {it.stage_name}
            </span>
          </div>
        ))}
    </div>
  );
}
