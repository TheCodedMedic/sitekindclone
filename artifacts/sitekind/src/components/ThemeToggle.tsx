import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const cls = document.documentElement.classList;
    cls.remove("dark", "light");
    cls.add(next ? "dark" : "light");
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem("waai-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--card-border)] text-ink-2 transition-colors hover:text-ink"
    >
      {mounted && dark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
