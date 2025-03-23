import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

// create event
export async function POST(request) {
  try {
    const { id, userId, title, date, recurring, color, description, endDate, type, tags, reminder } = await request.json();
    const event = await prisma.event.create({
      data: {
        id,
        userId,
        title,
        date,
        recurring,
        color,
        type,
        tags: {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag.name || tag },
            create: {
              name: tag.name || tag,
              color: tag.color || '#FF0000'
            }
          }))
        },
        description,
        endDate,
        reminder
      }
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

// update event
export async function PUT(request) {
  try {
    const { id, userId, title, date, recurring, color, description, start, end, type, tags, reminder } = await request.json();
    const event = await prisma.event.update({
      where: {
        id
      },
      data: {
        userId,
        title,
        date,
        recurring,
        color,
        type,
        tags: {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag.name || tag },
            create: {
              name: tag.name || tag,
              color: tag.color || '#FF0000'
            }
          }))
        },
        description,
        start,
        end,
        reminder
      }
    });
    
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
	try {
		const userId = (await params).accountId;
		const events = await prisma.event.findMany({
          where: {
              userId
          },
          include: {
              tags: true
          }
		});

		return NextResponse.json(events, { status: 200 });
	} catch (error) {
		console.error(error.stack);
		return NextResponse.json({ message: "An error occurred" }, { status: 500 });
	}
}


// delete event
export async function DELETE(request) {
  try {
    const { id } = request.query;
    await prisma.event.delete({
      where: {
        id
      }
    });
    
    return NextResponse.json({ message: "Event deleted" }, { status: 200 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
