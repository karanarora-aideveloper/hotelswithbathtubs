import { pathToFileURL } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const rel = specifier.slice(2);
    let target = path.join(projectRoot, 'src', rel);
    if (!target.endsWith('.ts') && !target.endsWith('.tsx') && !target.endsWith('.js') && !target.endsWith('.mjs')) {
      target += '.ts';
    }
    return nextResolve(pathToFileURL(target).href, context);
  }
  return nextResolve(specifier, context);
}
