"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { allNavLinks, isActiveLink, linkClass } from "./nav-links";

/**
 * Horizontal primary navigation bar rendered directly below the header.
 * Collapses on small screens, where the header hamburger menu takes over.
 */
export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden border-b border-border bg-surface px-4 sm:px-6 md:block"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 py-2">
        {allNavLinks.map((link) => {
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
      </div>
    </nav>
  );
}
