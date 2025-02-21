import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";
import { comparePassword, generateToken } from "@/utils/auth";

export async function POST(request) {
  const { username, password } = await request.json();

  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json(
      { message: "Invalid username or password" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !comparePassword(password, user.password)) {
    return NextResponse.json(
      { message: "Invalid username or password" },
      { status: 401 },
    );
  }

  const token = generateToken({ userId: user.id });

  return NextResponse.json({ token });
}