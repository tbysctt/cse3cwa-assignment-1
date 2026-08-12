import type { Phoneme } from "@/data/phonemes";
import { formatIpa } from "@/data/phonemes";
import { tileStatusClass, tileStatusLabel } from "@/lib/tile-styles";
import type { TileStatus } from "@/lib/wordle";

export function WordleCell({
  phoneme,
  status,
}: {
  phoneme?: Phoneme;
  status?: TileStatus;
}) {
  const label = phoneme
    ? `${formatIpa(phoneme.ipa)}${
        status ? ` — ${tileStatusLabel(status)}` : ""
      }`
    : "Empty cell";

  return (
    <div
      role="gridcell"
      aria-label={label}
      className={[
        "flex min-h-12 flex-col items-center justify-center rounded-md border-2 font-mono text-base transition-colors",
        tileStatusClass(status),
      ].join(" ")}
    >
      {phoneme ? (
        <>
          <span aria-hidden="true">{formatIpa(phoneme.ipa)}</span>
          <span className="mt-0.5 text-[0.65rem] font-sans font-semibold uppercase tracking-wide opacity-90">
            {phoneme.grapheme}
          </span>
        </>
      ) : (
        <span className="opacity-30" aria-hidden="true">
          ·
        </span>
      )}
    </div>
  );
}
