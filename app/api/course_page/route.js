import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, tag, userId } = await request.json();

    // Ensure all fields are filled out
    if (!name || !tag || !userId) {
      return NextResponse.json({ message: "Please fill out all fields" }, { status: 400 });
    }

    // Check for duplicate course by name or tag
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { name },
          { tag }
        ]
      },
    });

    if (course) {
      return NextResponse.json({ message: "Course already exists" }, { status: 400 });
    }

    // Create new course
    const newCourse = await prisma.course.create({
      data: {
        name,
        tag,
        userId // Ensure userId is correctly referenced here
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

// Gets courses and events from the user associated with the course
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url); // TODO: MAYBE CHANGE THE WAY THE ID GETS PASSED ON?
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // Fetch courses for the user
    const courses = await prisma.course.findMany({
      where: { userId },
    });

    // Fetch events for each course based on the tag
    const coursesWithEvents = await Promise.all(courses.map(async (course) => {
      const events = await prisma.event.findMany({
        where: {
          userId,
          tags: {
            some: {
              name: course.tag,
            },
          },
        },
      });
      return { ...course, events };
    }));

    return NextResponse.json(coursesWithEvents, { status: 200 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url); // TODO: MAYBE CHANGE THE WAY THE ID GETS PASSED ON?
    const courseId = searchParams.get('id');

    if (!courseId) {
      return NextResponse.json({ message: "Course ID is required" }, { status: 400 });
    }

    // Delete the course
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}