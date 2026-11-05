import fs from 'node:fs';
import path from 'node:path';
import { url } from './i18n';

/**
 * Image slots. Drop a file into public/img/ with the right name and it appears
 * automatically on the next build (no code or JSON change needed).
 *
 *   img/logo.(png|webp|svg)               brand logo
 *   img/welcome-hero.(webp|jpg|png)       welcome screen background
 *   img/dr-devarsh.(jpg|webp|png)         doctor photo
 *   img/cat/<category-slug>.*             category card art
 *   img/thumb/<condition-slug>.*          condition list thumbnail
 *   img/<condition-slug>/hero.*           anatomy picture on the condition page
 *   img/<condition-slug>/<exercise-id>.*  exercise picture
 */
const EXT = ['webp', 'png', 'jpg', 'jpeg', 'svg'];

export function asset(base: string): string | null {
  for (const ext of EXT) {
    if (fs.existsSync(path.join(process.cwd(), 'public', `${base}.${ext}`))) return url(`${base}.${ext}`);
  }
  return null;
}

export const catImg = (slug: string) => asset(`img/cat/${slug}`);
export const thumbImg = (slug: string, category: string) => asset(`img/thumb/${slug}`) ?? asset(`img/cat/${category}`);
