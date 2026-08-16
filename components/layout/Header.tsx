"use client";

import { student } from "@/lib/student";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { allNavLinks, isActiveLink, linkClass } from "./nav-links";

export function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <h1 className="block truncate text-xl font-semibold text-foreground sm:text-xl">{student.assessmentTitle}</h1>
        <div className="relative md:hidden">
          <button
            ref={buttonRef}
            type="button"
            className="ui-button ui-button-secondary h-10 w-10 p-0"
            aria-expanded={open}
            aria-controls={menuId}
            aria-haspopup="menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          </button>

          {open ? (
            <div
              ref={panelRef}
              id={menuId}
              role="menu"
              className="absolute right-0 z-40 mt-2 w-56"
            >
              <MobileMenu
                links={allNavLinks}
                onNavigate={() => setOpen(false)}
              />
            </div>
          ) : null}
        </div>
      </div>
      <nav
        aria-label="Primary"
        className="hidden border-b border-border bg-surface md:block"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
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

    </header>
  );
}
