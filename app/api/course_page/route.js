import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, tag, userId, colour } = await request.json();

    // Ensure all fields are filled out
    if (!name || !tag || !userId || !colour) {
      console.log(name); console.log(tag); console.log(userId); console.log(colour);
      return NextResponse.json({ message: "Please fill out all fields" }, { status: 400 });
    }

    // Check for duplicate course by name or tag
    const course = await prisma.course.findFirst({
      where: {
        userId,
        OR: [
          { name },
          { tag }
        ]
      },
    });

    if (course) {
      return NextResponse.json({ message: "A course with the same name or tag already exists" }, { status: 400 });
    }

    // Check if the tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: tag }
    });

    if (!existingTag) {
      await prisma.tag.create({
        data: {
          name: tag,
          color: colour
        }
      });
    }

    // Create new course
    const newCourse = await prisma.course.create({
      data: {
        name,
        tag,
        userId, // Ensure userId is correctly referenced here
        colour
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

export async function PUT(request) {
  try {
    const { id, name, tag, colour, userId } = await request.json();

    if (!id || !name || !tag || !colour) {
      return NextResponse.json({ message: "Please fill out all fields" }, { status: 400 });
    }

    let course = await prisma.course.findFirst({
      where: {
        userId,
        tag,
        NOT: {
          id,
        },
      },
    });

    if (course) {
      return NextResponse.json({ message: "A course with the same tag already exists" }, { status: 400 });
    }

    course = await prisma.course.findFirst({
      where: {
        userId,
        name,
        NOT: {
          id,
        },
      },
    });

    if (course) {
      return NextResponse.json({ message: "A course with the same name already exists" }, { status: 400 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { name, tag, colour },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error(error.stack);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}