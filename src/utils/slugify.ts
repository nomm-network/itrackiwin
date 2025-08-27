/**
 * Convert a string to a URL-friendly slug
 * Matches the server-side slugify function behavior
 */
export function slugify(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug by appending a short hash if needed
 */
export function generateUniqueSlug(name: string, existingSlugs?: string[]): string {
  const baseSlug = slugify(name);
  
  if (!existingSlugs || !existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // If slug exists, append a short random hash
  const hash = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${hash}`;
}