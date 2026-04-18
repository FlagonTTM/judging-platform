import { useState, type FormEvent } from 'react';
import { useTeams } from '@/lib/queries';
import { useCreateTeam, useDeleteTeam } from '@/lib/mutations';

export function TeamsRoster({ eventId }: { eventId: string }) {
  const { data: teams = [], isLoading } = useTeams(eventId);
  const create = useCreateTeam(eventId);
  const del = useDeleteTeam(eventId);
  const [name, setName] = useState('');
  const [track, setTrack] = useState('');
  const [contact, setContact] = useState('');

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      name,
      track: track || null,
      contacts: contact ? { telegram: contact } : {},
    });
    setName('');
    setTrack('');
    setContact('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Команды</h3>
        {isLoading ? (
          <p className="text-slate-500 mt-2">Загрузка…</p>
        ) : teams.length === 0 ? (
          <p className="text-slate-500 mt-2">Команд пока нет</p>
        ) : (
          <ul className="divide-y border rounded bg-white mt-2">
            {teams.map((t) => (
              <li key={t.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-slate-500">
                    {t.track ?? 'без трека'}
                    {t.contacts && Object.keys(t.contacts).length > 0
                      ? ' · ' + Object.entries(t.contacts).map(([k, v]) => `${k}: ${v}`).join(', ')
                      : ''}
                  </p>
                </div>
                <button
                  className="text-red-600 text-sm hover:underline"
                  onClick={() => del.mutate(t.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={onCreate} className="space-y-3 max-w-md">
        <h4 className="font-semibold">Добавить команду</h4>
        <input
          required
          placeholder="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          placeholder="Трек / кейс (опционально)"
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          placeholder="Telegram-контакт (опционально)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="bg-slate-800 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          Добавить
        </button>
      </form>
    </div>
  );
}
