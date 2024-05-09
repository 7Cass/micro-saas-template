/**
 * Constructs a complete URL by combining the base URL from environment variables with a given path.
 * If the path does not start with a slash, one is prepended.
 *
 * @param {string} [path] - The path to append to the base URL.
 * @returns {string} The full URL constructed from the base URL and the normalized path.
 */
export function getUrl(path?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const normalizedPath = path?.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
