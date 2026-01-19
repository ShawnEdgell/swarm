import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // This forces Svelte 5 to be modern, but helps
    // clear out the 'new App' instantiation error.
    runes: true
  }
}

export default config
