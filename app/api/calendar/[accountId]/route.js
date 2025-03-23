import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

// Get user's calendars
export async function GET(_, { params }) {
    try {
        const userId = (await params).accountId;
        const calendars = await prisma.calendar.findMany({
            where: {
                users: {
                    some: {
                        id: userId
                    }
                },
            },
        });

        return NextResponse.json({ calendars }, { status: 200 });
    } catch (error) {
        console.error(error.stack);
        return NextResponse.json(
            { message: "An error occurred" },
            { status: 500 }
        );
    }
}
