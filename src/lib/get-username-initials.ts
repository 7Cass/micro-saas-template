/**
 * Extracts the initials from the first two words of a given username, or the first initial if only one word is present.
 * 
 * @param {string | null} [username] - The full username from which to extract initials.
 * @returns {string} The initials extracted from the username, or '?' if no username is provided.
 */
export function getUsernameInitials(username?: string | null): string {
    if (!username) return '?';

    const words = username.trim().split(/\s+/);
    const initials = words.slice(0, Math.min(2, words.length)).map(word => word.charAt(0).toUpperCase()).join('');
    return initials;
}
