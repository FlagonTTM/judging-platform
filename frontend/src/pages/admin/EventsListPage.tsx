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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">События</h1>
      </div>

      <section>
        {isLoading ? (
          <p className="text-slate-500">Загрузка…</p>
        ) : events.length === 0 ? (
          <p className="text-slate-500">Пока нет ни одного события</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Название
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Даты
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/events/${e.id}`}
                        className="font-medium text-slate-900 hover:text-emerald-700 transition-colors"
                      >
                        {e.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(e.start_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                      {' — '}
                      {new Date(e.end_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {e.leaderboard_public && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            рейтинг открыт
                          </span>
                        )}
                        {e.results_published && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                            результаты
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-md">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Создать событие</h3>
          <form className="space-y-4" onSubmit={onCreate}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
              <input
                required
                placeholder="TulaHack 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Начало</label>
              <input
                required
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Окончание</label>
              <input
                required
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={create.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 py-2.5 font-medium transition-colors disabled:opacity-50"
            >
              {create.isPending ? 'Создаём…' : 'Создать'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
