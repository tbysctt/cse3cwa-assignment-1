export function HintToggle({
  value,
  onChange,
  name,
  description,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  name: string;
  description: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-foreground">
        Show phoneme hints
      </legend>
      <p className="mt-0.5 text-xs text-absent">{description}</p>
      <div
        className="mt-2 flex gap-4"
        role="radiogroup"
        aria-label="Show phoneme hints"
      >
        {[
          { value: true, label: "Yes" },
          { value: false, label: "No" },
        ].map((option) => (
          <label
            key={option.label}
            className="flex cursor-pointer items-center gap-2 text-sm font-medium"
          >
            <input
              type="radio"
              name={name}
              className="size-4 accent-[var(--accent)]"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
