/**
 * Returns the correct base URL for images based on the current environment.
 * * - Dev (Port 5173): Returns "http://localhost:3000" so images load from backend.
 * - Prod (Port 1995): Returns "" so images load relatively via Nginx.
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Already absolute (external link)
  
  // Check if running on standard Vite dev port
  if (window.location.port === '5173') {
    return `http://localhost:3000${path}`;
  }
  
  // Production / Docker
  return path;
};