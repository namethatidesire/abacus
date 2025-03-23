import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/auth";
import { describe } from "node:test";

// app/api/signup/route.js
export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !password || !email) {
      return NextResponse.json({ message: "Please fill out all fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (user) {
      return NextResponse.json({ message: "Username already exists" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashPassword(password),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    const newCalendar = await prisma.calendar.create({
      data: {
        ownerId: newUser.id,
        name: "Personal",
        description: "The default calendar.",
        main: true,
        shared: false,
        users: {
          connect: [
            {
              id: newUser.id,
            },
          ],
        },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}