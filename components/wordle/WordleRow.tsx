import type { Phoneme } from "@/data/phonemes";
import type { TileStatus } from "@/lib/wordle";
import { WordleCell } from "./WordleCell";

export type WordleRowView = {
  phonemes: (Phoneme | undefined)[];
  statuses: (TileStatus | undefined)[];
};

export function WordleRow({
  row,
  columns,
}: {
  row: WordleRowView;
  columns: string;
}) {
  return (
    <div role="row" className="grid gap-1.5" style={{ gridTemplateColumns: columns }}>
      {row.phonemes.map((phoneme, index) => (
        <WordleCell
          key={`${index}-${phoneme?.ipa ?? "empty"}`}
          phoneme={phoneme}
          status={row.statuses[index]}
        />
      ))}
    </div>
  );
}
