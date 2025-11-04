import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Octokit } from "@octokit/rest";

// Topbar is an async server component. It will fetch the repo star count server-side.
export async function Topbar({ onOpenSidebar, onStartTour }: { onOpenSidebar?: () => void; onStartTour?: () => void }) {
  // Try to use Octokit with a token (recommended). Fallback to unauthenticated fetch.
  let stars: number | null = null;
  try {
    const owner = "priynshuchouhn";
    const repo = "certifyly";
    const token = process.env.GITHUB_TOKEN;

    if (token) {
      // Authenticated request via Octokit (recommended). Works reliably and avoids low unauthenticated rate limits.
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.repos.get({ owner, repo });
      stars = typeof data.stargazers_count === "number" ? data.stargazers_count : null;
    } else {
      // Don't perform unauthenticated requests automatically; many environments (CI, corp networks)
      // or browser-injected scripts can trigger errors or be rate-limited. To avoid noisy errors
      // and unreliable counts, we skip the unauthenticated fetch when no token is provided.
      stars = null;
    }
  } catch {
    // ignore and show fallback
    stars = null;
  }

  const formattedStars = stars !== null ? new Intl.NumberFormat().format(stars) : "-";

  return (
    <header className="h-16 border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/80">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Hamburger only on small screens */}
          <button
            aria-label="Open menu"
            onClick={() => onOpenSidebar && onOpenSidebar()}
            className="md:hidden p-2 rounded-md hover:bg-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates, certificates..."
              className="pl-10 bg-secondary border-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onStartTour && onStartTour()}>
            Tour
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>

          {/* Custom GitHub badge — full control over styling. */}
          <a
            href="https://github.com/priynshuchouhn/certifyly"
            target="_blank"
            aria-label="View certifyly on GitHub"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md hover:bg-secondary text-sm text-muted-foreground"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
            <span className="ml-1 px-2 py-0.5 bg-border rounded-full text-xs font-medium">{formattedStars}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
