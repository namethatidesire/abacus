import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export function hashPassword(password) {
  return bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS));
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
//Generate a token using key and expiry time from the .env file
export function generateToken(object) {
  return jwt.sign(object, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });
}