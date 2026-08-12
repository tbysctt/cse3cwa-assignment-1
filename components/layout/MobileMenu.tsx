"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isActiveLink,
  linkClass,
  type allNavLinks,
} from "./nav-links";

type NavLink = (typeof allNavLinks)[number];

export function MobileMenu({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Compact menu"
      className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-2 shadow-lg"
    >
      {links.map((link) => {
        const active = isActiveLink(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass(active)}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
