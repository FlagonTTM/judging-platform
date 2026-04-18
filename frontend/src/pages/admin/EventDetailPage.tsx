import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvent } from '@/lib/queries';
import { CriteriaBuilder } from './components/CriteriaBuilder';
import { TeamsRoster } from './components/TeamsRoster';
import { EventSettings } from './components/EventSettings';

type Tab = 'criteria' | 'teams' | 'settings';

export default function EventDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: event } = useEvent(id);
  const [tab, setTab] = useState<Tab>('criteria');

  if (!event) return <p className="text-slate-500">Загрузка…</p>;

  const tabClass = (active: boolean) =>
    'px-4 py-2 border-b-2 text-sm ' +
    (active
      ? 'border-slate-900 text-slate-900 font-medium'
      : 'border-transparent text-slate-500 hover:text-slate-700');

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/events" className="text-sm text-slate-500 hover:underline">
          ← К списку событий
        </Link>
        <h2 className="text-2xl font-semibold mt-2">{event.name}</h2>
        <p className="text-sm text-slate-500">
          {new Date(event.start_at).toLocaleString('ru-RU')} —{' '}
          {new Date(event.end_at).toLocaleString('ru-RU')}
        </p>
      </div>

      <div className="border-b flex gap-2">
        <button onClick={() => setTab('criteria')} className={tabClass(tab === 'criteria')}>
          Критерии
        </button>
        <button onClick={() => setTab('teams')} className={tabClass(tab === 'teams')}>
          Команды
        </button>
        <button onClick={() => setTab('settings')} className={tabClass(tab === 'settings')}>
          Настройки
        </button>
      </div>

      {tab === 'criteria' && <CriteriaBuilder eventId={id} />}
      {tab === 'teams' && <TeamsRoster eventId={id} />}
      {tab === 'settings' && <EventSettings eventId={id} />}
    </div>
  );
}
