import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-[var(--page-pad-y)] sm:px-6"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
