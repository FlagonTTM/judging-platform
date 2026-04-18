import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useCriteria, useMyScores, useTeamProgress } from '@/lib/queries';
import { useSubmitScores, useUpsertScores } from '@/lib/mutations';
import { StarRating } from './components/StarRating';
import { StageProgressBar } from '@/components/StageProgressBar';
import type { Team } from '@/lib/types';

export default function JudgeScorePage() {
  const { teamId = '' } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (!teamId) return;
    (async () => {
      const events = (await api.get('/events')).data as Array<{ id: string }>;
      for (const e of events) {
        const teams = (await api.get(`/events/${e.id}/teams`)).data as Team[];
        const found = teams.find((t) => t.id === teamId);
        if (found) {
          setTeam(found);
          return;
        }
      }
    })();
  }, [teamId]);

  const { data: criteria = [] } = useCriteria(team?.event_id);
  const { data: myScores = [] } = useMyScores(teamId);
  const { data: progress } = useTeamProgress(teamId);
  const upsert = useUpsertScores(teamId);
  const submit = useSubmitScores(teamId);

  const [values, setValues] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (myScores.length === 0) return;
    const v: Record<string, number> = {};
    const c: Record<string, string> = {};
    for (const s of myScores) {
      v[s.criterion_id] = Number(s.value);
      c[s.criterion_id] = s.comment ?? '';
    }
    setValues((prev) => ({ ...v, ...prev }));
    setComments((prev) => ({ ...c, ...prev }));
  }, [myScores.length]);

  const submitted = myScores.some((s) => s.status === 'submitted');

  const onSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await upsert.mutateAsync(
        criteria
          .filter((c) => values[c.id] !== undefined)
          .map((c) => ({
            criterion_id: c.id,
            value: values[c.id],
            comment: comments[c.id] || undefined,
          })),
      );
      setSaved(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Ошибка сохранения');
    }
  };

  const onSubmit = async () => {
    setError(null);
    try {
      const items = criteria
        .filter((c) => values[c.id] !== undefined)
        .map((c) => ({
          criterion_id: c.id,
          value: values[c.id],
          comment: comments[c.id] || undefined,
        }));
      if (items.length > 0) {
        await upsert.mutateAsync(items);
      }
      await submit.mutateAsync();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Не удалось отправить — заполните все критерии');
    }
  };

  if (!team) return <p className="text-slate-500">Загрузка…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/judge" className="text-sm text-slate-500 hover:underline">
          ← К списку команд
        </Link>
        <h2 className="text-2xl font-semibold mt-2">{team.name}</h2>
        {team.track && <p className="text-sm text-slate-500">{team.track}</p>}
      </div>

      {progress && progress.items.length > 0 && (
        <div className="rounded border bg-white p-4">
          <div className="mb-2 text-sm font-semibold">Прогресс команды</div>
          <StageProgressBar items={progress.items} />
        </div>
      )}

      {submitted && (
        <div className="bg-sky-50 text-sky-900 border border-sky-200 rounded px-4 py-3 text-sm">
          Оценки уже отправлены. Изменить нельзя.
        </div>
      )}

      <div className="space-y-5">
        {criteria.map((c) => (
          <div key={c.id} className="border bg-white rounded p-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{c.name}</h3>
              <span className="text-xs text-slate-500">
                вес {c.weight}% · макс. {c.max_score}
              </span>
            </div>
            <StarRating
              value={values[c.id] ?? 0}
              max={c.max_score}
              disabled={submitted}
              onChange={(v) => setValues((prev) => ({ ...prev, [c.id]: v }))}
            />
            <textarea
              placeholder="Комментарий (опционально)"
              value={comments[c.id] ?? ''}
              disabled={submitted}
              onChange={(e) => setComments((prev) => ({ ...prev, [c.id]: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm disabled:bg-slate-50"
              rows={2}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {saved && !submitted && (
        <p className="text-emerald-700 text-sm">Черновик сохранён</p>
      )}

      {!submitted && (
        <div className="flex gap-3">
          <button
            onClick={onSave}
            disabled={upsert.isPending}
            className="border border-slate-300 rounded px-4 py-2 disabled:opacity-50"
          >
            {upsert.isPending ? 'Сохраняем…' : 'Сохранить черновик'}
          </button>
          <button
            onClick={onSubmit}
            disabled={submit.isPending}
            className="bg-slate-800 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {submit.isPending ? 'Отправляем…' : 'Отправить оценки'}
          </button>
        </div>
      )}
    </div>
  );
}
