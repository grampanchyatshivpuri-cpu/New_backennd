/**
 * Middleware to check if user has permission to access a specific task
 *
 * Usage:
 * router.post('/api/representatives', authenticateToken, checkPermission('task1'), async (req, res) => {...})
 *
 * Permission Format:
 * - Admin: permissions = ["*"] (full access)
 * - Editor: permissions = ["task1", "task3", "task5"] (specific tasks)
 * - Viewer: permissions = [] (read-only, no POST/PUT/DELETE)
 */

const checkPermission = (requiredTask) => {
  return (req, res, next) => {
    const user = req.user; // Set by authenticateToken middleware

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Admin has full access
    if (user.role === "admin") {
      return next();
    }

    // Check if user has wildcard permission
    if (user.permissions && user.permissions.includes("*")) {
      return next();
    }

    // Check if user has specific task permission
    if (user.permissions && user.permissions.includes(requiredTask)) {
      return next();
    }

    // Permission denied
    return res.status(403).json({
      success: false,
      message:
        "तुम्हाला या कार्यासाठी परवानगी नाही (You do not have permission for this task)",
    });
  };
};

/**
 * Middleware to check if user has read-only or write access
 * Viewer role can only GET, not POST/PUT/DELETE
 */
const checkWritePermission = (requiredTask) => {
  return (req, res, next) => {
    const user = req.user;
    const method = req.method;

    // Allow GET requests for all authenticated users
    if (method === "GET") {
      return next();
    }

    // Viewer role cannot modify data
    if (user.role === "viewer") {
      return res.status(403).json({
        success: false,
        message:
          "तुम्ही फक्त माहिती पाहू शकता, बदल करू शकत नाही (You can only view, not modify)",
      });
    }

    // Check task-specific permission
    return checkPermission(requiredTask)(req, res, next);
  };
};

module.exports = { checkPermission, checkWritePermission };
