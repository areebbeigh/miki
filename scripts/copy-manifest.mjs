import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'manifest.json');
const dest = join(root, 'dist', 'manifest.json');

mkdirSync(join(root, 'dist'), { recursive: true });
if (!existsSync(src)) {
  console.error('manifest.json missing at', src);
  process.exit(1);
}
copyFileSync(src, dest);
console.log('Copied manifest.json → dist/manifest.json');
