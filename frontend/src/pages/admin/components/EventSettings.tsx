import { useEffect, useState, type FormEvent } from 'react';
import { useEvent } from '@/lib/queries';
import { useUpdateEvent } from '@/lib/mutations';

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string): string | null {
  if (!local) return null;
  return new Date(local).toISOString();
}

export function EventSettings({ eventId }: { eventId: string }) {
  const { data: event } = useEvent(eventId);
  const update = useUpdateEvent(eventId);

  const [name, setName] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [deadline, setDeadline] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!event) return;
    setName(event.name);
    setStartAt(toLocalInput(event.start_at));
    setEndAt(toLocalInput(event.end_at));
    setDeadline(toLocalInput(event.deadline));
  }, [event]);

  if (!event) return <p className="text-slate-500">Загрузка…</p>;

  const onSaveInfo = async (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    await update.mutateAsync({
      name,
      start_at: fromLocalInput(startAt) ?? undefined,
      end_at: fromLocalInput(endAt) ?? undefined,
      deadline: fromLocalInput(deadline),
    });
    setSaved(true);
  };

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
    <div className="space-y-8 max-w-xl">
      <form onSubmit={onSaveInfo} className="space-y-4">
        <h3 className="font-semibold text-slate-900">Общая информация</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Начало</label>
            <input
              type="datetime-local"
              required
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Конец</label>
            <input
              type="datetime-local"
              required
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Дедлайн (необязательно)
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={update.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 py-2.5 font-medium transition-colors disabled:opacity-50"
          >
            {update.isPending ? 'Сохраняем…' : 'Сохранить'}
          </button>
          {saved && !update.isPending && (
            <span className="text-xs text-emerald-600">сохранено</span>
          )}
        </div>
      </form>

      <div>
        <h3 className="font-semibold text-slate-900 mb-2">Флаги видимости</h3>
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
    </div>
  );
}
