import { useEvent } from '@/lib/queries';
import { useUpdateEvent } from '@/lib/mutations';

export function EventSettings({ eventId }: { eventId: string }) {
  const { data: event } = useEvent(eventId);
  const update = useUpdateEvent(eventId);

  if (!event) return <p className="text-slate-500">Загрузка…</p>;

  const toggle = (field: 'leaderboard_public' | 'results_published' | 'judge_comments_visible') => {
    update.mutate({ [field]: !event[field] });
  };

  const Row = ({
    field,
    title,
    desc,
  }: {
    field: 'leaderboard_public' | 'results_published' | 'judge_comments_visible';
    title: string;
    desc: string;
  }) => (
    <div className="flex items-start justify-between py-4 border-b border-slate-100 last:border-b-0">
      <div className="pr-6">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => toggle(field)}
        className={
          'relative flex-shrink-0 h-6 w-11 rounded-full transition-colors ' +
          (event[field] ? 'bg-emerald-500' : 'bg-slate-200')
        }
        aria-pressed={event[field]}
      >
        <span
          className={
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ' +
            (event[field] ? 'translate-x-5' : 'translate-x-0.5')
          }
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-xl space-y-0">
      <h3 className="font-semibold text-slate-900 mb-4">Настройки события</h3>
      <Row
        field="leaderboard_public"
        title="Публичный leaderboard"
        desc="Доступен всем без авторизации, обновляется live"
      />
      <Row
        field="results_published"
        title="Результаты опубликованы"
        desc="Команды могут видеть свои финальные оценки"
      />
      <Row
        field="judge_comments_visible"
        title="Показывать комментарии жюри"
        desc="Видны командам после публикации результатов"
      />
    </div>
  );
}
