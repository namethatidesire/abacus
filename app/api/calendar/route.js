import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const data = await request.json();
    const { accountId, query } = data;

    // Fetching
    if (query === "all") {
        return getAllCalendars(accountId);
    } else if (query === "default") {
        return getDefaultCalendar(accountId);
    } else if (query === "create") {
        return createCalendar(data);
    } else if (query === "update") {
        return updateCalendar(data);
    } else if (query === "delete") {
        return deleteCalendar(data);
    } else if (query === "share") {
        return shareCalendar(data);
    }

    return NextResponse.json({ message: "Invalid query" }, { status: 400 });
}

// Get user's calendars
async function getAllCalendars(accountId) {
    try {
        const calendars = await prisma.user.findUnique({
            where: {
                id: accountId,
            },
            select: {
                calendars: true,
            },
        });

        return NextResponse.json(calendars, { status: 200 });
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

async function createCalendar(data) {
    try {
        const { accountId, name, description } = data;
        const calendar = await prisma.calendar.create({
            data: {
                ownerId: accountId,
                name,
                description,
                users: {
                    connect: [
                    {
                        id: accountId,
                    },
                    ],
                },
            },
        });

        return NextResponse.json({ calendar }, { status: 201 });
    } catch (error) {
        console.error(error.stack);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}

async function updateCalendar(data) {
    try {
        const { calendarId, name, description } = data;
        const calendar = await prisma.calendar.update({
            where: {
                id: calendarId
            },
            data: {
                name,
                description
            }
        });

        return NextResponse.json({ calendar }, { status: 200 });
    } catch (error) {
        console.error(error.stack);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}

async function deleteCalendar(data) {
    try {
        const { calendarId } = data;

        await prisma.event.deleteMany({
            where: {
                calendarId: calendarId
            }
        });

        const calendar = await prisma.calendar.delete({
            where: {
                id: calendarId,
                main: false,
                shared: false
            }
        });

        return NextResponse.json({ calendar }, { status: 200 });
    } catch (error) {
        console.error(error.stack);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}

async function shareCalendar(data) {
    try {
        const { calendarId, email } = data;
        const user = await prisma.user.findUnique({
            where: {
                email
            },
            select: {
                id: true
            }
        });

        const calendar = await prisma.calendar.update({
            where: {
                id: calendarId
            },
            data: {
                users: {
                    connect: [
                        {
                            id: user.id
                        }
                    ]
                }
            }
        });

        return NextResponse.json({ calendar }, { status: 200 });
    } catch (error) {
        console.error(error.stack);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}
