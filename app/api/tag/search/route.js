import { prisma } from '@/utils/db';
import { NextResponse } from 'next/server';

	// Function to search for events
export async function POST(request, { params }) {
	try {
	    const { userId, eventTitle, eventType, eventTags, filterOR } = await request.json();

		let foundEvents;
		if (filterOR) {
		    if (eventTags.length > 0) {
                 foundEvents = await prisma.event.findMany({
                 	where:  {
                 		userId: userId,
                 		title: {
                 			contains: eventTitle
                 		},
                 		type: eventType,
                 		tags: {
                                some: {
                                  name: {
                                    in: eventTags
                                  }
                                }
                        },
                 	},
                 });
		    }
			else { // ignore event tags if OR is selected and tag field is empty
			    foundEvents = await prisma.event.findMany({
               		where:  {
               			userId: userId,
               			title: {
               				contains: eventTitle
               			},
               			type: eventType,
               		},
               	});
			}
		}
		else { //FilterAND
			foundEvents = await prisma.event.findMany({
				where:  {
					userId: userId,
					title: {
					contains: eventTitle
					},
					type: eventType,
//					tags: {
//						hasEvery: eventTags,
//					},
                    AND: eventTags.map(eventTags => ({
                      tags: {
                        some: {
                          name: eventTags
                        }
                      }
                    }))
				},
			});
		}
		return NextResponse.json(foundEvents, { status: 200 });
	} catch (error) {
	    console.log(error);
		return NextResponse.json({ message: "An error occurred", error: error }, { status: 500 });
	}
}
