import { useState, type FormEvent } from 'react';
import { useTeams } from '@/lib/queries';
import { useCreateTeam, useDeleteTeam } from '@/lib/mutations';

export function TeamsRoster({ eventId }: { eventId: string }) {
  const { data: teams = [], isLoading } = useTeams(eventId);
  const create = useCreateTeam(eventId);
  const del = useDeleteTeam(eventId);
  const [name, setName] = useState('');
  const [track, setTrack] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [contact, setContact] = useState('');

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    const contacts: Record<string, string> = {};
    if (ownerEmail) contacts.owner_email = ownerEmail;
    if (contact) contacts.telegram = contact;
    await create.mutateAsync({ name, track: track || null, contacts });
    setName('');
    setTrack('');
    setOwnerEmail('');
    setContact('');
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900">Команды</h3>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Загрузка…</p>
      ) : teams.length === 0 ? (
        <p className="text-slate-500 text-sm">Команд пока нет</p>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Команда
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Трек
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Контакт
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{t.track ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {(t.contacts as Record<string, string>)?.owner_email ?? ''}
                    {(t.contacts as Record<string, string>)?.telegram
                      ? ` · tg: ${(t.contacts as Record<string, string>).telegram}`
                      : ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="text-sm text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => del.mutate(t.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={onCreate} className="space-y-4 max-w-md pt-2 border-t border-slate-100">
        <h4 className="font-medium text-slate-900">Добавить команду</h4>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
          <input
            required
            placeholder="Team Awesome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Трек / кейс</label>
          <input
            placeholder="Опционально"
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email участника</label>
          <input
            type="email"
            placeholder="team@example.com"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telegram-контакт</label>
          <input
            placeholder="@username"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={create.isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 py-2.5 font-medium transition-colors disabled:opacity-50"
        >
          {create.isPending ? 'Добавляем…' : 'Добавить'}
        </button>
      </form>
    </div>
  );
}
