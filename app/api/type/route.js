import { prisma } from '@/utils/db';
import { NextResponse } from 'next/server';

	// Function to count user events by type
export async function POST(request, { params }) {
	try {
	    const {userId, eventType} = await request.json();

		let eventCounts;
		eventCoun   ts = await prisma.event.count({
			select: {
                completeEvents: {
                    where:  {
                    	userId: userId,
                    	type: "EVENT",
                    	complete: true,
                    },
                },
                incompleteEvents: {
                    where:  {
                    	userId: userId,
                    	type: "EVENT",
                    	complete: false,
                    },
                },
                completeTasks: {
                    where:  {
                    	userId: userId,
                    	type: "TASK",
                    	complete: true,
                    },
                },
                incompleteTasks: {
                    where:  {
                    	userId: userId,
                    	type: "TASK",
                    	complete: false,
                    },
                },
			},
		});
		return NextResponse.json(foundEvents, { status: 200 });
	} catch (error) {
	    console.log(error);
		return NextResponse.json({ message: "An error occurred", error: error }, { status: 500 });
	}
}
