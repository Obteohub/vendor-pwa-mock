/**
 * String and HTML utilities for the PWA
 */

/**
 * Strips HTML tags from a string and returns the plain text.
 * Used for character counting in rich text fields.
 * @param {string} html - The HTML string to strip
 * @returns {string} - The plain text content
 */
export const stripHtml = (html) => {
    if (!html) return '';

    // Use a temporary DOM element if in browser
    if (typeof document !== 'undefined') {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    // Fallback for SSR
    return html.replace(/<[^>]*>?/gm, '');
};

/**
 * Truncates an HTML string by its plain text content
 * (Experimental - use with caution as it might leave open tags)
 */
export const truncateHtml = (html, maxLength) => {
    const text = stripHtml(html);
    if (text.length <= maxLength) return html;
    return text.substring(0, maxLength) + '...';
};
