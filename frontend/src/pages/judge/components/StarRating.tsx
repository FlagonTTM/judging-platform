interface Props {
  value: number;
  max: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export function StarRating({ value, max, onChange, disabled }: Props) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            data-filled={filled}
            onClick={() => onChange(n)}
            className={
              'text-2xl leading-none transition-colors ' +
              (filled ? 'text-amber-400' : 'text-slate-300') +
              (disabled ? ' cursor-not-allowed' : ' hover:text-amber-500')
            }
            aria-label={`${n} из ${max}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
