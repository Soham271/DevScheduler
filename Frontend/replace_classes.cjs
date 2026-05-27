const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Lenovo\\Desktop\\finalScheduler\\DevScheduler\\Frontend\\src\\pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const replacements = [
  { search: /bg-white/g, replace: 'bg-[var(--color-canvas-white)]' },
  { search: /border-gray-100/g, replace: 'border-[var(--color-ash-gray)]' },
  { search: /border-gray-200/g, replace: 'border-[var(--color-ash-gray)]' },
  { search: /text-gray-900/g, replace: 'text-[var(--color-charcoal)]' },
  { search: /text-gray-700/g, replace: 'text-[var(--color-charcoal)]' },
  { search: /text-gray-600/g, replace: 'text-[var(--color-slate-blue)]' },
  { search: /text-gray-500/g, replace: 'text-[var(--color-cool-gray)]' },
  { search: /text-gray-400/g, replace: 'text-[var(--color-cool-gray)]' },
  { search: /bg-gray-50/g, replace: 'bg-[var(--color-buttermilk)]' },
  { search: /bg-gray-100/g, replace: 'bg-[var(--color-ash-gray)]' },
  { search: /text-brand-[0-9]{3}/g, replace: 'text-[var(--color-charcoal)]' },
  { search: /bg-brand-[0-9]{3}/g, replace: 'bg-[var(--color-buttermilk)]' },
  { search: /border-brand-[0-9]{3}/g, replace: 'border-[var(--color-charcoal)]' },
  { search: /ring-brand-[0-9]{3}/g, replace: 'ring-[var(--color-charcoal)]' },
  { search: /shadow-sm/g, replace: 'shadow-[var(--shadow-subtle-3)]' },
  { search: /shadow-md/g, replace: 'shadow-[var(--shadow-subtle)]' },
  { search: /bg-gradient-to-[a-z]+\sfrom-[a-z]+-[0-9]+\sto-[a-z]+-[0-9]+/g, replace: 'bg-[var(--color-charcoal)]' },
  { search: /bg-gradient-to-[a-z]+\sfrom-[a-z]+-[0-9]+\svia-[a-z]+-[0-9]+\sto-[a-z]+-[0-9]+/g, replace: 'bg-[var(--color-charcoal)]' },
  { search: /text-white/g, replace: 'text-[var(--color-canvas-white)]' },
  { search: /rounded-2xl/g, replace: 'rounded-[12px]' },
  { search: /rounded-xl/g, replace: 'rounded-[12px]' },
  { search: /rounded-full/g, replace: 'rounded-[16px]' },
];

for (const file of files) {
  const filePath = path.join(dir, file);
  if (['LandingPage.jsx', 'Dashboard.jsx'].includes(file)) continue; // Already done

  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
