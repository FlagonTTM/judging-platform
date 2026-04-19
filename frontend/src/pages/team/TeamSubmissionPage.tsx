import { useEffect, useState, type FormEvent } from 'react';
import { useMyTeam, useSubmission } from '@/lib/queries';
import {
  useSaveSubmission,
  useSubmissionCheck,
  useSubmissionPreview,
} from '@/lib/mutations';
import type {
  CheckResult,
  CheckStatus,
  CoverageLevel,
  PreviewResult,
  Submission,
} from '@/lib/types';

const EMPTY: Submission = {
  description: '',
  repo_url: '',
  demo_url: '',
  video_url: '',
  screenshot_url: '',
};

const checkBadge: Record<CheckStatus, string> = {
  ok: 'bg-emerald-100 text-emerald-700',
  weak: 'bg-amber-100 text-amber-700',
  missing: 'bg-slate-100 text-slate-500',
  broken: 'bg-red-100 text-red-700',
};

const checkLabel: Record<CheckStatus, string> = {
  ok: 'OK',
  weak: 'слабо',
  missing: 'нет',
  broken: 'битая',
};

const overallBanner: Record<CheckResult['overall'], { bg: string; text: string; label: string }> = {
  ready: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    label: 'Готово к оценке',
  },
  weak: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    label: 'Можно лучше',
  },
  not_ready: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    label: 'Ещё не готово',
  },
};

const coverageBadge: Record<CoverageLevel, string> = {
  strong: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  missing: 'bg-red-100 text-red-700',
};

const coverageLabel: Record<CoverageLevel, string> = {
  strong: 'раскрыт',
  partial: 'частично',
  missing: 'не раскрыт',
};

function toForm(s: Submission | undefined): Submission {
  if (!s) return { ...EMPTY };
  return {
    description: s.description ?? '',
    repo_url: s.repo_url ?? '',
    demo_url: s.demo_url ?? '',
    video_url: s.video_url ?? '',
    screenshot_url: s.screenshot_url ?? '',
  };
}

export default function TeamSubmissionPage() {
  const { data: team } = useMyTeam();
  const { data: submission } = useSubmission(team?.id);
  const save = useSaveSubmission(team?.id ?? '');
  const check = useSubmissionCheck(team?.id ?? '');
  const preview = useSubmissionPreview(team?.id ?? '');

  const [form, setForm] = useState<Submission>(EMPTY);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (submission) setForm(toForm(submission));
  }, [submission]);

  if (!team) {
    return (
      <p className="text-slate-500">У вас пока нет команды. Обратитесь к администратору.</p>
    );
  }

  const onChange = (key: keyof Submission) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    await save.mutateAsync({
      description: form.description?.trim() || null,
      repo_url: form.repo_url?.trim() || null,
      demo_url: form.demo_url?.trim() || null,
      video_url: form.video_url?.trim() || null,
      screenshot_url: form.screenshot_url?.trim() || null,
    });
    setSavedAt(Date.now());
  };

  const runCheck = () => check.mutate();
  const runPreview = () => preview.mutate();

  const checkResult = check.data as CheckResult | undefined;
  const previewResult = preview.data as PreviewResult | undefined;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{team.name}</h1>
        <p className="text-sm text-slate-500 mt-1">Заявка на оценку</p>
      </div>

      <form
        onSubmit={onSave}
        className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Короткое описание (2–3 предложения)
          </label>
          <textarea
            rows={4}
            value={form.description ?? ''}
            onChange={onChange('description')}
            placeholder="Что вы делаете, для кого, какую боль закрываете"
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabelledInput
            label="Репозиторий"
            value={form.repo_url ?? ''}
            onChange={onChange('repo_url')}
            placeholder="https://github.com/…"
          />
          <LabelledInput
            label="Demo-ссылка"
            value={form.demo_url ?? ''}
            onChange={onChange('demo_url')}
            placeholder="https://…"
          />
          <LabelledInput
            label="Demo-видео"
            value={form.video_url ?? ''}
            onChange={onChange('video_url')}
            placeholder="https://youtu.be/…"
          />
          <LabelledInput
            label="Скриншот"
            value={form.screenshot_url ?? ''}
            onChange={onChange('screenshot_url')}
            placeholder="https://…"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={save.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 py-2.5 font-medium transition-colors disabled:opacity-50"
          >
            {save.isPending ? 'Сохраняем…' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={runCheck}
            disabled={check.isPending}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-5 py-2.5 font-medium transition-colors disabled:opacity-50"
          >
            {check.isPending ? 'Проверяем…' : 'Проверить готовность'}
          </button>
          <button
            type="button"
            onClick={runPreview}
            disabled={preview.isPending}
            className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg px-5 py-2.5 font-medium transition-colors disabled:opacity-50"
          >
            {preview.isPending ? 'Анализируем…' : 'Как увидит жюри'}
          </button>
          {savedAt && !save.isPending && (
            <span className="text-xs text-slate-400">сохранено</span>
          )}
        </div>
      </form>

      {checkResult && (
        <section className={`rounded-xl border p-5 ${overallBanner[checkResult.overall].bg}`}>
          <p className={`font-semibold ${overallBanner[checkResult.overall].text}`}>
            {overallBanner[checkResult.overall].label}
          </p>
          <ul className="mt-3 space-y-2">
            {checkResult.items.map((it) => (
              <li key={it.key} className="flex items-start gap-3 text-sm">
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium min-w-[64px] ${checkBadge[it.status]}`}
                >
                  {checkLabel[it.status]}
                </span>
                <div>
                  <p className="text-slate-900 font-medium">{it.label}</p>
                  <p className="text-slate-500">{it.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {previewResult && (
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              Как читается проект
            </p>
            <p className="mt-2 text-slate-900 font-medium text-lg italic">
              «{previewResult.one_liner}»
            </p>
          </div>

          {previewResult.features.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                Ключевые фичи (как их увидит судья)
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-700">
                {previewResult.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {previewResult.coverage.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                Покрытие критериев
              </p>
              <ul className="mt-2 space-y-2">
                {previewResult.coverage.map((c) => (
                  <li key={c.criterion_id} className="flex items-start gap-3 text-sm">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium min-w-[84px] ${coverageBadge[c.coverage]}`}
                    >
                      {coverageLabel[c.coverage]}
                    </span>
                    <div>
                      <p className="text-slate-900 font-medium">{c.criterion_name}</p>
                      <p className="text-slate-500">{c.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {previewResult.weak_spots.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                Слабые места
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-amber-800">
                {previewResult.weak_spots.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {previewResult.likely_questions.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                Что скорее всего спросит жюри
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-700">
                {previewResult.likely_questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function LabelledInput(props: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{props.label}</label>
      <input
        type="url"
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
    </div>
  );
}
