import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function GET(request) {
    //Extract the token value
  const authorization = request.headers.get("Authorization");
  const token = authorization && authorization.split(" ")[1];


  //Check if the token is missing or invalid
  if (!token) {
    return NextResponse.json(
      {error: "Missing token", status: 401 },
    );
  }

  //Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.json({decoded, status: 200});
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid token", status: 403 }
    );
  }
}