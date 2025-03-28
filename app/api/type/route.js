import { prisma } from '@/utils/db';
import { NextResponse } from 'next/server';

	// Function to count user events by type
export async function POST(request, { params }) {
	try {
	    const {userId} = await request.json();
        let completeEvents = await prisma.event.count({
            where:  {
                userId: userId,
                type: "EVENT",
                completion: true,
           },
        });
        let incompleteEvents = await prisma.event.count({
              where:  {
                  userId: userId,
                  type: "EVENT",
                  completion: false,
              },
        });
        let completeTasks = await prisma.event.count({
              where:  {
                  userId: userId,
                  type: "TASK",
                  completion: true,
              },
        });
        let incompleteTasks = await prisma.event.count({
               where:  {
                   userId: userId,
                   type: "TASK",
                   completion: false,
               },
         });

        const eventCounts = {completeEvents: completeEvents, incompleteEvents: incompleteEvents, completeTasks: completeTasks, incompleteTasks: incompleteTasks};
		return NextResponse.json(eventCounts, { status: 200 });
	} catch (error) {
	    console.log(error);
		return NextResponse.json({ message: "An error occurred", error: error }, { status: 500 });
	}
}
