import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "1d";

// Validate JWT_SECRET on module load
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters long');
}

export async function generateToken(user) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT({
    userId: user.id || user._id?.toString(),
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRY)
    .setIssuedAt()
    .setIssuer('quiz-app')
    .setAudience('quiz-app-users')
    .sign(secret);
  
  return token;
}

export async function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'quiz-app',
      audience: 'quiz-app-users'
    });
    
    if (!payload.userId || !payload.email) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

export function extractToken(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }
  
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}

export async function requireAuth(req) {
  const token = extractToken(req);
  
  if (!token) {
    return { authenticated: false, error: "No token provided" };
  }
  
  const decoded = await verifyToken(token);
  
  if (!decoded) {
    return { authenticated: false, error: "Invalid or expired token" };
  }
  
  return { authenticated: true, user: decoded };
}

export async function requireAdmin(req) {
  const authResult = await requireAuth(req);
  
  if (!authResult.authenticated) {
    return authResult;
  }
  
  if (authResult.user.role !== "admin") {
    return { authenticated: false, error: "Admin access required" };
  }
  
  return authResult;
}
