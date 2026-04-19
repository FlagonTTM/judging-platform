import { useState, type FormEvent } from 'react';
import { useCriteria } from '@/lib/queries';
import { useCreateCriterion, useDeleteCriterion } from '@/lib/mutations';

export function CriteriaBuilder({ eventId }: { eventId: string }) {
  const { data: criteria = [], isLoading } = useCriteria(eventId);
  const create = useCreateCriterion(eventId);
  const del = useDeleteCriterion(eventId);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState(10);
  const [maxScore, setMaxScore] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ name, weight, max_score: maxScore });
      setName('');
      setWeight(10);
      setMaxScore(10);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Ошибка');
    }
  };

  const sumOk = totalWeight === 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Критерии оценки</h3>
        <span className="text-xs text-slate-400">вес критериев в процентах, сумма = 100</span>
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Загрузка…</p>
      ) : criteria.length === 0 ? (
        <p className="text-slate-500 text-sm">Критериев пока нет</p>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          {criteria.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 font-medium text-slate-900">{c.name}</div>
              <span className="font-mono text-lg font-semibold text-emerald-700 tabular-nums w-16 text-right">
                {c.weight}%
              </span>
              <span className="text-sm text-slate-400 tabular-nums w-12 text-right">
                /{c.max_score}
              </span>
              <button
                className="text-sm text-slate-400 hover:text-red-600 transition-colors w-20 text-right"
                onClick={() => del.mutate(c.id)}
              >
                Удалить
              </button>
            </div>
          ))}
          <div
            className={
              'flex items-center gap-4 px-5 py-3 font-medium ' +
              (sumOk
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-amber-50 text-amber-800')
            }
          >
            <div className="flex-1">Σ суммарный вес</div>
            <span className="font-mono text-lg font-semibold tabular-nums w-16 text-right">
              {totalWeight}%
            </span>
            <span className="text-sm text-slate-400 w-12 text-right">
              {sumOk ? 'ок' : 'нужно 100'}
            </span>
            <span className="w-20" />
          </div>
        </div>
      )}

      <form onSubmit={onCreate} className="space-y-4 max-w-md pt-2 border-t border-slate-100">
        <h4 className="font-medium text-slate-900">Добавить критерий</h4>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
          <input
            required
            placeholder="Техническая реализация"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Вес, %</label>
            <input
              required
              type="number"
              min={1}
              max={100}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Макс. балл</label>
            <input
              required
              type="number"
              min={1}
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
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
