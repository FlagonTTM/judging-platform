import { useState, type FormEvent } from 'react';
import { useTeams } from '@/lib/queries';
import {
  useCreateTeam,
  useDeleteTeam,
  useImportTeams,
  useUpdateTeam,
  type ImportTeamsResult,
} from '@/lib/mutations';
import { isAxiosError } from 'axios';
import type { Team } from '@/lib/types';

interface EditDraft {
  id: string;
  name: string;
  track: string;
  ownerEmail: string;
  telegram: string;
}

export function TeamsRoster({ eventId }: { eventId: string }) {
  const { data: teams = [], isLoading } = useTeams(eventId);
  const create = useCreateTeam(eventId);
  const update = useUpdateTeam(eventId);
  const del = useDeleteTeam(eventId);
  const importMut = useImportTeams(eventId);
  const [edit, setEdit] = useState<EditDraft | null>(null);
  const [name, setName] = useState('');
  const [track, setTrack] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [contact, setContact] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [skipHeader, setSkipHeader] = useState(true);
  const [importResult, setImportResult] = useState<ImportTeamsResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const onImport = async (e: FormEvent) => {
    e.preventDefault();
    setImportResult(null);
    setImportError(null);
    try {
      const res = await importMut.mutateAsync({
        sheet_url: sheetUrl,
        skip_header: skipHeader,
      });
      setImportResult(res);
      if (res.created > 0) setSheetUrl('');
    } catch (err) {
      const detail = isAxiosError(err)
        ? (err.response?.data as { detail?: string } | undefined)?.detail
        : undefined;
      setImportError(detail ?? 'Не удалось импортировать таблицу');
    }
  };

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

  const startEdit = (t: Team) => {
    const c = (t.contacts ?? {}) as Record<string, string>;
    setEdit({
      id: t.id,
      name: t.name,
      track: t.track ?? '',
      ownerEmail: c.owner_email ?? '',
      telegram: c.telegram ?? '',
    });
  };

  const saveEdit = async () => {
    if (!edit) return;
    const contacts: Record<string, string> = {};
    if (edit.ownerEmail) contacts.owner_email = edit.ownerEmail;
    if (edit.telegram) contacts.telegram = edit.telegram;
    await update.mutateAsync({
      id: edit.id,
      name: edit.name,
      track: edit.track || null,
      contacts,
    });
    setEdit(null);
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
              {teams.map((t) =>
                edit && edit.id === t.id ? (
                  <tr key={t.id} className="border-b border-slate-100 last:border-b-0 bg-emerald-50/30">
                    <td className="px-4 py-3">
                      <input
                        value={edit.name}
                        onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                        className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={edit.track}
                        onChange={(e) => setEdit({ ...edit, track: e.target.value })}
                        className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm"
                        placeholder="—"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={edit.ownerEmail}
                        onChange={(e) => setEdit({ ...edit, ownerEmail: e.target.value })}
                        className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm mb-1"
                        placeholder="email"
                      />
                      <input
                        value={edit.telegram}
                        onChange={(e) => setEdit({ ...edit, telegram: e.target.value })}
                        className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm"
                        placeholder="@telegram"
                      />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        className="text-sm text-emerald-700 hover:text-emerald-900 mr-3 font-medium"
                        onClick={saveEdit}
                        disabled={update.isPending}
                      >
                        {update.isPending ? '…' : 'Сохранить'}
                      </button>
                      <button
                        className="text-sm text-slate-500 hover:text-slate-700"
                        onClick={() => setEdit(null)}
                      >
                        Отмена
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={t.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{t.track ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {(t.contacts as Record<string, string>)?.owner_email ?? ''}
                      {(t.contacts as Record<string, string>)?.telegram
                        ? ` · tg: ${(t.contacts as Record<string, string>).telegram}`
                        : ''}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        className="text-sm text-slate-500 hover:text-slate-700 transition-colors mr-3"
                        onClick={() => startEdit(t)}
                      >
                        Изменить
                      </button>
                      <button
                        className="text-sm text-red-500 hover:text-red-700 transition-colors"
                        onClick={() => del.mutate(t.id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={onImport} className="space-y-3 max-w-xl pt-2 border-t border-slate-100">
        <div>
          <h4 className="font-medium text-slate-900">Импорт из Google Таблиц</h4>
          <p className="text-xs text-slate-500 mt-1">
            Откройте доступ по ссылке. Столбцы: название · трек · email · telegram · участники…
          </p>
        </div>
        <input
          required
          placeholder="https://docs.google.com/spreadsheets/d/…"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={skipHeader}
            onChange={(e) => setSkipHeader(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          В первой строке заголовок
        </label>
        {importError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {importError}
          </p>
        )}
        {importResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-800">
            Создано: {importResult.created}, пропущено: {importResult.skipped}
            {importResult.errors.length > 0 && (
              <ul className="mt-1 text-red-700 list-disc list-inside">
                {importResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={importMut.isPending}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-5 py-2.5 font-medium transition-colors disabled:opacity-50"
        >
          {importMut.isPending ? 'Импортируем…' : 'Импортировать'}
        </button>
      </form>

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
