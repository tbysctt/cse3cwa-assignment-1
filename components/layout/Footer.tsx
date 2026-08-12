import { student } from "@/lib/student";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-sm text-absent sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          {student.name} · Student number {student.studentNumber}
        </p>
        <p>{student.assessmentTitle}</p>
      </div>
    </footer>
  );
}
