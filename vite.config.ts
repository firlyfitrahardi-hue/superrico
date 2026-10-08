import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset URLs, so the build works at the domain root, under a sub-path such as
  // GitHub Pages (https://<user>.github.io/superrico/), or opened from any other host.
  base: './',
})
