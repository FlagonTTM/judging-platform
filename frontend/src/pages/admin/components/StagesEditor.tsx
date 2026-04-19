import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStages } from '@/lib/queries';
import { createStage, deleteStage, updateStage } from '@/lib/mutations';

export function StagesEditor({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const { data: stages = [] } = useStages(eventId);
  const [name, setName] = useState('');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['stages', eventId] });

  const create = useMutation({
    mutationFn: () => createStage(eventId, name, stages.length),
    onSuccess: () => { setName(''); invalidate(); },
  });
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateStage(id, { name }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteStage,
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Этапы хакатона</h3>
      <ol className="space-y-2">
        {stages.map((s) => (
          <li key={s.id} className="flex items-center gap-3">
            <span className="w-6 text-sm text-slate-400 font-medium">{s.order + 1}.</span>
            <input
              defaultValue={s.name}
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              onBlur={(e) => {
                if (e.target.value !== s.name) rename.mutate({ id: s.id, name: e.target.value });
              }}
            />
            <button
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
              onClick={() => remove.mutate(s.id)}
            >
              Удалить
            </button>
          </li>
        ))}
      </ol>
      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate(); }}
        className="flex gap-2 pt-2 border-t border-slate-100"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Новый этап (например, Демо)"
          className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Добавить
        </button>
      </form>
    </div>
  );
}
