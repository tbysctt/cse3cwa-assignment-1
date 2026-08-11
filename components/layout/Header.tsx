import Link from "next/link";
import { student } from "@/lib/student";
import { NavBar } from "./NavBar";

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            CSE3CWA Assessment 1
          </p>
          <Link
            href="/"
            className="block truncate text-lg font-semibold text-foreground sm:text-xl"
          >
            {student.shortTitle}
          </Link>
        </div>
        <NavBar />
      </div>
    </header>
  );
}
