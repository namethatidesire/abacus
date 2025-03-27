import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

// get taskEstimate
export async function GET(request, { params }) {
    try {
        const userId = (await params).accountId;
        const taskEstimate = await prisma.taskEstimate.findUnique({
            where: {
                userId: userId// Ensure the userId field is included here
            },
        });
        if (taskEstimate === null) {
            const newTaskEstimate = await prisma.taskEstimate.create({
                data: {
                    userId: userId,
                    // Add other necessary fields here
                },
            });
            return NextResponse.json(newTaskEstimate, { status: 200 });
        }
        return NextResponse.json(taskEstimate, { status: 200 });
    } catch (error) {
        console.error(error.stack);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}


// update taskEstimate
export async function PUT(request, { params }) {
    try {
        const {difficulty, newRatio } = await request.json();
        const userId = (await params).accountId;

        const existingTaskEstimate = await prisma.taskEstimate.findUnique({
            where: {
                userId
            }
        });

        const multiplierKey = `multiplier${difficulty}`;
        const dividerKey = `divider${difficulty}`;

        let updatedData;
        if (existingTaskEstimate[dividerKey] === 0) {
            updatedData = { [multiplierKey]: newRatio, [dividerKey]: 1 };
        } else {
            const newMultiplier = parseFloat(existingTaskEstimate[multiplierKey]) + parseFloat(newRatio);
            const newDivider = existingTaskEstimate[dividerKey] + 1;

            updatedData = { [multiplierKey]: newMultiplier, [dividerKey]: newDivider };
        }

        const taskEstimate = await prisma.taskEstimate.update({
            where: {
                userId
            },
            data: updatedData
        });

        return NextResponse.json(taskEstimate, { status: 200 });

    } catch (error) {
        console.error(error.stack);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}
