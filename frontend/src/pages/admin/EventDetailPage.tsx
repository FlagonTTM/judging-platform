import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvent } from '@/lib/queries';
import { CriteriaBuilder } from './components/CriteriaBuilder';
import { TeamsRoster } from './components/TeamsRoster';
import { EventSettings } from './components/EventSettings';
import { StagesEditor } from './components/StagesEditor';
import { ProgressMatrix } from './components/ProgressMatrix';

type Tab = 'criteria' | 'teams' | 'stages' | 'progress' | 'settings';

export default function EventDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: event } = useEvent(id);
  const [tab, setTab] = useState<Tab>('criteria');

  if (!event) return <p className="text-slate-500">Загрузка…</p>;

  const tabClass = (active: boolean) =>
    'px-4 py-2.5 border-b-2 text-sm font-medium transition-colors ' +
    (active
      ? 'border-emerald-600 text-emerald-700'
      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300');

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/events"
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← К списку событий
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">{event.name}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date(event.start_at).toLocaleString('ru-RU')} —{' '}
          {new Date(event.end_at).toLocaleString('ru-RU')}
        </p>
      </div>

      <div className="border-b border-slate-200 flex gap-1">
        <button onClick={() => setTab('criteria')} className={tabClass(tab === 'criteria')}>
          Критерии
        </button>
        <button onClick={() => setTab('teams')} className={tabClass(tab === 'teams')}>
          Команды
        </button>
        <button onClick={() => setTab('stages')} className={tabClass(tab === 'stages')}>
          Этапы
        </button>
        <button onClick={() => setTab('progress')} className={tabClass(tab === 'progress')}>
          Прогресс
        </button>
        <button onClick={() => setTab('settings')} className={tabClass(tab === 'settings')}>
          Настройки
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        {tab === 'criteria' && <CriteriaBuilder eventId={id} />}
        {tab === 'teams' && <TeamsRoster eventId={id} />}
        {tab === 'stages' && <StagesEditor eventId={id} />}
        {tab === 'progress' && <ProgressMatrix eventId={id} />}
        {tab === 'settings' && <EventSettings eventId={id} />}
      </div>
    </div>
  );
}
