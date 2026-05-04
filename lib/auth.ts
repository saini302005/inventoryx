import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env.local file");
}

export type TokenUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
};

export function createToken(user: TokenUser) {
  return jwt.sign(user, JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET as string) as TokenUser;
  } catch {
    return null;
  }
}