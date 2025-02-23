import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export function hashPassword(password) {
  return bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS));
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(object) {
  return jwt.sign(object, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });
}

export function verifyToken(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const token = authorization.replace("Bearer ", "");

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
