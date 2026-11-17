import { cpSync, mkdirSync, rmSync } from 'node:fs';

const OUTPUT = '_site';

// артефакт в git не нужен, поэтому просто пересобираем с нуля
rmSync(OUTPUT, { recursive: true, force: true });
mkdirSync(OUTPUT, { recursive: true });

for (const entry of ['index.html', 'style.css', 'assets', 'dist']) {
  cpSync(entry, `${OUTPUT}/${entry}`, { recursive: true });
}

console.log(`Static site assembled in ${OUTPUT}/`);
