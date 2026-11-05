import { defineConfig } from 'astro/config';

// GitHub Pages: https://goyaldevarsh-gif.github.io/know-your-condition/
// If a custom domain is added later, set base to '/' and update site.
export default defineConfig({
  site: 'https://goyaldevarsh-gif.github.io',
  base: '/know-your-condition',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
