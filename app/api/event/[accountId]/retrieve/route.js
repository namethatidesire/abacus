import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

// get events
export async function GET(request) {
	try {
		const { userId } = request.query;
		const events = await prisma.event.findMany({
		where: {
			userId
		}
		});

		return NextResponse.json(events, { status: 200 });
	} catch (error) {
		console.error(error.stack);
		return NextResponse.json({ message: "An error occurred" }, { status: 500 });
	}
}
