import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/auth";

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
        username: true,
        email: true,
      },
    });

    // Create the TaskEstimate for the new user
    const taskEstimate = await prisma.taskEstimate.create({
      data: {
          userId: newUser.id,
          multiplier1: 1.0,
          multiplier2: 1.0,
          multiplier3: 1.0,
          multiplier4: 1.0,
          multiplier5: 1.0,
          divider1: 0,
          divider2: 0,
          divider3: 0,
          divider4: 0,
          divider5: 0,
      },
    });


    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}