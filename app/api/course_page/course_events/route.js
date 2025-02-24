import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tag = searchParams.get('tag');

    if (!userId || !tag) {
      return NextResponse.json({ message: "User ID and tag are required" }, { status: 400 });
    }

    // Find all the events that have the tag
    const events = await prisma.event.findMany({
      where: {
        userId,
        tags: {
          some: {
            name: tag,
          },
        },
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}