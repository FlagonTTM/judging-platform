import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCriteria, useMyScores, useTeam, useTeamProgress } from '@/lib/queries';
import { useSubmitScores, useUpsertScores } from '@/lib/mutations';
import { StarRating } from './components/StarRating';
import { StageProgressBar } from '@/components/StageProgressBar';

export default function JudgeScorePage() {
  const { teamId = '' } = useParams<{ teamId: string }>();
  const { data: team } = useTeam(teamId);
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
      v[s.criterion_id] = s.value;
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
          .map((c) => ({ criterion_id: c.id, value: values[c.id], comment: comments[c.id] || undefined })),
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
        .map((c) => ({ criterion_id: c.id, value: values[c.id], comment: comments[c.id] || undefined }));
      if (items.length > 0) await upsert.mutateAsync(items);
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
        <Link to="/judge" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
          ← К списку команд
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">{team.name}</h1>
        {team.track && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 mt-1">
            {team.track}
          </span>
        )}
      </div>

      {progress && progress.items.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-sm font-medium text-slate-700 mb-3">Прогресс команды</p>
          <StageProgressBar items={progress.items} />
        </div>
      )}

      {submitted && (
        <div className="bg-sky-50 text-sky-800 border border-sky-200 rounded-xl px-4 py-3 text-sm font-medium">
          Оценки уже отправлены. Изменить нельзя.
        </div>
      )}

      <div className="space-y-4">
        {criteria.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{c.name}</h3>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  {c.weight}%
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  макс. {c.max_score}
                </span>
              </div>
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
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={2}
            />
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {saved && !submitted && (
        <p className="text-emerald-700 text-sm font-medium">Черновик сохранён</p>
      )}

      {!submitted && (
        <div className="flex gap-3">
          <button
            onClick={onSave}
            disabled={upsert.isPending}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-5 py-2.5 font-medium transition-colors disabled:opacity-50"
          >
            {upsert.isPending ? 'Сохраняем…' : 'Сохранить черновик'}
          </button>
          <button
            onClick={onSubmit}
            disabled={submit.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 py-2.5 font-medium transition-colors disabled:opacity-50"
          >
            {submit.isPending ? 'Отправляем…' : 'Отправить оценки'}
          </button>
        </div>
      )}
    </div>
  );
}
