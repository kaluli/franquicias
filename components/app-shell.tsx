"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, LayoutGrid, LogOut, Zap } from "lucide-react";
import { logout } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Ranking", icon: LayoutGrid },
  { href: "/feria", label: "Modo Feria", icon: Zap },
  { href: "/comparar", label: "Comparar", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-sm text-white">◆</span>
            Franchise Evaluator
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium",
                  active(n.href) ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            ))}
            <button onClick={signOut} className="ml-2 flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-zinc-500 hover:text-zinc-900">
              <LogOut className="size-4" /> Salir
            </button>
          </nav>
          <button onClick={signOut} aria-label="Salir" className="flex size-10 items-center justify-center rounded-lg text-zinc-500 md:hidden">
            <LogOut className="size-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:pb-12">
        {children}
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium",
                active(n.href) ? "text-accent" : "text-zinc-500",
              )}
            >
              <n.icon className="size-5" />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
