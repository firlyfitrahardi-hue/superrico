/**
 * Resolves a site-relative asset path ("/images/x.webp") against Vite's base URL, so the
 * same code works at the domain root and under a sub-path such as GitHub Pages.
 */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '')
