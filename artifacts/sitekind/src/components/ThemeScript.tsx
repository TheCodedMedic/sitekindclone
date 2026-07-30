// Applies the persisted theme before first paint to avoid a flash.
// Light is the default (redesign 2026-07; docs/redesign-plan.md).
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('waai-theme');var d=t==='dark';var c=document.documentElement.classList;c.remove('dark','light');c.add(d?'dark':'light');document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){document.documentElement.classList.add('light');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
