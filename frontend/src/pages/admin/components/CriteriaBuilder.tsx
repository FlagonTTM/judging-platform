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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3">
          <h3 className="font-semibold">Критерии</h3>
          <span
            className={
              totalWeight === 100
                ? 'text-sm text-emerald-700'
                : 'text-sm text-amber-700'
            }
          >
            сумма весов: {totalWeight} / 100
          </span>
        </div>
        {isLoading ? (
          <p className="text-slate-500 mt-2">Загрузка…</p>
        ) : criteria.length === 0 ? (
          <p className="text-slate-500 mt-2">Критериев пока нет</p>
        ) : (
          <ul className="divide-y border rounded bg-white mt-2">
            {criteria.map((c) => (
              <li key={c.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-slate-500">
                    вес {c.weight}% · макс. балл {c.max_score}
                  </p>
                </div>
                <button
                  className="text-red-600 text-sm hover:underline"
                  onClick={() => del.mutate(c.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={onCreate} className="space-y-3 max-w-md">
        <h4 className="font-semibold">Добавить критерий</h4>
        <input
          required
          placeholder="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <div className="flex gap-3">
          <label className="flex-1 text-sm text-slate-600">
            Вес, %
            <input
              required
              type="number"
              min={1}
              max={100}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <label className="flex-1 text-sm text-slate-600">
            Макс. балл
            <input
              required
              type="number"
              min={1}
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
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
