import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

// Get user's calendars
export async function GET(request, { params }) {
	try {
		const userId = (await params).accountId;
		const defaultCalendar = await prisma.calendar.findFirst({
			where: {
				ownerId: userId,
				main: true
			}
		});
		return NextResponse.json(defaultCalendar, { status: 200 });
	} catch (error) {
		console.error(error.stack);
		return NextResponse.json({ message: "An error occurred" }, { status: 500 });
	}
}
