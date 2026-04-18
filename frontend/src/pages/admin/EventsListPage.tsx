import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '@/lib/queries';
import { useCreateEvent } from '@/lib/mutations';

export default function EventsListPage() {
  const { data: events = [], isLoading } = useEvents();
  const create = useCreateEvent();
  const [name, setName] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      name,
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
    });
    setName('');
    setStartAt('');
    setEndAt('');
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">События</h2>
        {isLoading ? (
          <p className="text-slate-500">Загрузка…</p>
        ) : events.length === 0 ? (
          <p className="text-slate-500">Пока нет ни одного события</p>
        ) : (
          <ul className="divide-y border rounded bg-white">
            {events.map((e) => (
              <li key={e.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <Link to={`/admin/events/${e.id}`} className="font-medium hover:underline">
                    {e.name}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {new Date(e.start_at).toLocaleString('ru-RU')} —{' '}
                    {new Date(e.end_at).toLocaleString('ru-RU')}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  {e.leaderboard_public && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded">
                      рейтинг открыт
                    </span>
                  )}
                  {e.results_published && (
                    <span className="px-2 py-1 bg-sky-100 text-sky-800 rounded">
                      результаты опубликованы
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="max-w-md">
        <h3 className="text-lg font-semibold mb-3">Создать событие</h3>
        <form className="space-y-3" onSubmit={onCreate}>
          <input
            required
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <label className="block text-sm text-slate-600">
            Начало
            <input
              required
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block text-sm text-slate-600">
            Окончание
            <input
              required
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={create.isPending}
            className="bg-slate-800 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {create.isPending ? 'Создаём…' : 'Создать'}
          </button>
        </form>
      </section>
    </div>
  );
}
