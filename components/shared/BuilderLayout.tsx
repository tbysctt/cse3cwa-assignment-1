/**
 * Shared vertical layout for builder configuration and its live preview.
 */
export function BuilderLayout({
  config,
  preview,
}: {
  config: React.ReactNode;
  preview: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">{config}</div>
      <div className="flex flex-col gap-6">{preview}</div>
    </div>
  );
}
