import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:max-w-5xl">
        <p className="text-xs text-slate-500">
          © 2025 FryReef
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/faq"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            FAQ
          </Link>
          <a
            href="https://www.notion.so/FryReef-Roadmap-2bdde4de81e4804c9b87ea83d0a730d5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Roadmap
          </a>
          <a
            href="https://x.com/iwbamwc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition hover:text-white"
            aria-label="X (Twitter)"
          >
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

