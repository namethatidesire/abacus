import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { accountId, query } = await request.json();
    console.log(accountId, query);
    if (query === "all") {
        return getAllCalendars(accountId);
    } else if (query === "default") {
        return getDefaultCalendar(accountId);
    }
    return NextResponse.json({ message: "Invalid query" }, { status: 400 });
}

// Get user's calendars
async function getAllCalendars(userId) {
    try {
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


async function getDefaultCalendar(accountId) {
    try {
        const defaultCalendar = await prisma.calendar.findFirst({
            where: {
                ownerId: accountId,
                main: true
            }
        });
        return NextResponse.json(defaultCalendar, { status: 200 });
    } catch (error) {
        console.error(error.stack);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}