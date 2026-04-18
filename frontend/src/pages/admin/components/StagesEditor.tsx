import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useStages } from '@/lib/queries';
import { createStage, deleteStage, updateStage } from '@/lib/mutations';

export function StagesEditor({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const { data: stages = [] } = useStages(eventId);
  const [name, setName] = useState('');

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['stages', eventId] });

  const create = useMutation({
    mutationFn: () => createStage(eventId, name, stages.length),
    onSuccess: () => {
      setName('');
      invalidate();
    },
  });
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateStage(id, { name }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteStage,
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {stages.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <span className="w-6 text-slate-500">{s.order + 1}.</span>
            <input
              defaultValue={s.name}
              className="flex-1 rounded border px-2 py-1"
              onBlur={(e) => {
                if (e.target.value !== s.name) {
                  rename.mutate({ id: s.id, name: e.target.value });
                }
              }}
            />
            <button
              className="text-red-600 text-sm"
              onClick={() => remove.mutate(s.id)}
            >
              Удалить
            </button>
          </li>
        ))}
      </ol>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Новый этап (например, Демо)"
          className="flex-1 rounded border px-2 py-1"
        />
        <button
          type="submit"
          className="rounded bg-slate-900 px-3 py-1 text-white text-sm"
        >
          Добавить
        </button>
      </form>
    </div>
  );
}
