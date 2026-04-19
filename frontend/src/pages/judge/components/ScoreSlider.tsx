interface Props {
  value: number;
  max: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export function ScoreSlider({ value, max, onChange, disabled }: Props) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 h-2">
        <div className="absolute inset-0 rounded-full bg-slate-200" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={0}
          max={max}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label={`Оценка: ${value} из ${max}`}
        />
      </div>
      <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums w-14 text-right">
        {value} / {max}
      </span>
    </div>
  );
}
