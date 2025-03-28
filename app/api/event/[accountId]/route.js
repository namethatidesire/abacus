import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

// create event
export async function POST(request) {
  try {
    const { userId, calendarId, title, date, recurring, color, type, tags, description, task, expectedTime, completionTime, difficulty, endDate, reminder } = await request.json();
    const event = await prisma.event.create({
      data: {
        userId,
        calendarId,
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
        task,
        expectedTime,
        completionTime,
        difficulty, // Add difficulty difficulty // Add difficulty
        endDate,
        reminder
      }
    });
    
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

// update event
export async function PUT(request) {
  try {
    const {id, userId, title, date, recurring, color, type, tags, description, task, completed, expectedTime, completionTime, difficulty, endDate, reminder } = await request.json();
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
        endDate,
        task,
        completed,
        expectedTime,
        completionTime,
        difficulty, // Add difficulty
        reminder
      }
    });
    
    return NextResponse.json({ event }, { status: 200 });
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

		return NextResponse.json({ events }, { status: 200 });
	} catch (error) {
		console.error(error.stack);
		return NextResponse.json({ message: "An error occurred" }, { status: 500 });
	}
}


// delete event - CORRECTED VERSION
export async function DELETE(request) {
  try {
    // In App Router, we need to get the URL and extract the ID parameter
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ message: "Event ID is required" }, { status: 400 });
    }

    // First, disconnect all tags from the event
    await prisma.event.update({
      where: { id },
      data: {
        tags: {
          set: [] // This removes all tag connections
        }
      }
    });
    
    // Then delete the event
    const deletedEvent = await prisma.event.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      message: "Event deleted successfully", 
      event: deletedEvent 
    }, { status: 200 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ 
      message: "Failed to delete event", 
      error: error.message 
    }, { status: 500 });
  }
}
