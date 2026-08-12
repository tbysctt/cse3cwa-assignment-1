/**
 * Two-column layout used by the builder pages. On desktop the configuration
 * panel sits on the left and the live activity preview on the right; on small
 * screens everything stacks vertically (configuration first, preview second).
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
