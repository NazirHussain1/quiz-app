import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = "1d"; // 1 day

export function generateToken(user) {
  return jwt.sign(
    { 
      userId: user.id || user._id?.toString(), 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Ensure token has required fields
    if (!decoded.userId || !decoded.email) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    // Token expired or invalid
    if (error.name === "TokenExpiredError") {
      console.log("Token expired");
    } else if (error.name === "JsonWebTokenError") {
      console.log("Invalid token");
    }
    return null;
  }
}

/**
 * Extract token from request headers
 */
export function extractToken(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }
  
  // Support "Bearer <token>" format
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}

/**
 * Verify user is authenticated
 */
export function requireAuth(req) {
  const token = extractToken(req);
  
  if (!token) {
    return { authenticated: false, error: "No token provided" };
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return { authenticated: false, error: "Invalid or expired token" };
  }
  
  return { authenticated: true, user: decoded };
}

/**
 * Verify user is admin
 */
export function requireAdmin(req) {
  const authResult = requireAuth(req);
  
  if (!authResult.authenticated) {
    return authResult;
  }
  
  if (authResult.user.role !== "admin") {
    return { authenticated: false, error: "Admin access required" };
  }
  
  return authResult;
}
