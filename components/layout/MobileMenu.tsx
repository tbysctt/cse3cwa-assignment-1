"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isActiveLink,
  linkClass,
  type allNavLinks,
} from "./nav-links";

type NavLink = (typeof allNavLinks)[number];

export function MobileMenu({
  links,
  onNavigate,
}: {
  links: readonly NavLink[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Compact menu"
      className="flex flex-col gap-2 rounded-[var(--surface-radius)] border border-border bg-surface p-2 shadow-lg"
    >
      {links.map((link) => {
        const active = isActiveLink(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass(active)}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
