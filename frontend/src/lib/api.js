/**
 * Centralized API base URL — import this everywhere instead of
 * duplicating `process.env.NEXT_PUBLIC_API_URL || '...'`.
 *
 * Change this single value before deployment.
 */
export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
