import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
	try {
    const { accountId, calendarId } = await request.json();
    const events = await prisma.calendar.findUnique({
      where: {
        id: calendarId,
        users: {
          some: {
            id: accountId
          }
        }
      },
      select: {
        events: true
      }
		});

		return NextResponse.json(events, { status: 200 });
	} catch (error) {
		console.error(error.stack);
		return NextResponse.json({ message: "An error occurred" }, { status: 500 });
	}
}
