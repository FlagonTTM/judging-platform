import { useEffect, useState } from 'react';

const fmt = (msLeft: number): string => {
  const total = Math.floor(msLeft / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}ч ${String(m).padStart(2, '0')}м ${String(s).padStart(2, '0')}с`;
};

export function EventTimer({ deadline }: { deadline: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!deadline) return null;
  const target = new Date(deadline).getTime();
  const left = target - now;
  return (
    <span className="text-sm font-mono text-gray-700">
      {left <= 0 ? 'Дедлайн прошёл' : fmt(left)}
    </span>
  );
}
