export function requireAdminAuth(req, res, next) {
  const adminToken = process.env.ADMIN_API_KEY || process.env.ADMIN_TOKEN;
  const authHeader = req.headers.authorization;

  if (!adminToken) {
    return res.status(500).json({
      error: 'Admin authentication not configured. Set ADMIN_API_KEY environment variable.',
      status: 'error',
    });
  }

  if (!authHeader) {
    return res.status(401).json({
      error: 'Missing authorization header',
      status: 'unauthorized',
    });
  }

  const token = authHeader.replace('Bearer ', '');

  if (token !== adminToken) {
    return res.status(403).json({
      error: 'Invalid admin credentials',
      status: 'forbidden',
    });
  }

  next();
}
