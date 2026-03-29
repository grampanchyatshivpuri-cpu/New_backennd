/**
 * Caching Middleware for Public API Endpoints
 * Adds appropriate Cache-Control headers for static/cacheable responses
 */

/**
 * Cache middleware for public GET endpoints (no authentication required)
 * Sets Cache-Control headers for CDN and browser caching
 * 
 * @param maxAge - Maximum age in seconds (default: 600s = 10 minutes)
 */
const cacheMiddleware = (maxAge = 5) => {
  return (req, res, next) => {
    // Only cache successful GET requests without authentication
    if (req.method === 'GET' && !req.headers.authorization) {
      // Public cache: s-maxage for CDN, max-age for browser
      // Adding must-revalidate to ensure browser checks with server
      res.set(
        'Cache-Control',
        `public, max-age=${maxAge}, s-maxage=${maxAge}, must-revalidate`
      );
      
      // CRITICAL: Include Authorization in Vary to prevent serving cached public response to authenticated users
      res.set('Vary', 'Accept-Encoding, Origin, Authorization');
    } else if (req.headers.authorization) {
      // Never cache authenticated requests (Admin actions)
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
    next();
  };
};

/**
 * No-cache middleware for dynamic endpoints (e.g., those that change frequently)
 * Use this for write operations or user-specific data
 */
const noCacheMiddleware = () => {
  return (req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  };
};

module.exports = {
  cacheMiddleware,
  noCacheMiddleware,
};
