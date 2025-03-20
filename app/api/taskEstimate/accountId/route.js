import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

// create task estimate
export async function POST(request){
    try{
        const{id, userId, multiplier1, multiplier2, multiplier3, multiplier4, multiplier5, divider1, divider2, divider3, divider4, divider5} = await request.json();
        const taskEstimate = await prisma.taskEstimate.create({
            data: {
                id,
                userId,
                multiplier1,
                multiplier2,
                multiplier3,
                multiplier4,
                multiplier5,
                divider1,
                divider2,
                divider3,
                divider4,
                divider5
            }
        });
        return NextResponse.json(taskEstimate, {status: 201});
    } catch(error){
        console.error(error.stack);
        return NextResponse.json({message: "An error occurred"}, {status: 500});
    }
}

// update taskEstimate
export async function PUT(request) {
    try {
        const { id, difficulty, newRatio} = await request.json();

        const existingTaskEstimate = await prisma.taskEstimate.findUnique({
            where: {
              id
            }
        });

        const multiplierKey = `multiplier${difficulty}`;
        const dividerKey = `divider${difficulty}`;

        let updatedData;
        if(existingTaskEstimate[dividerKey] === 0){
            updatedData = {[multiplierKey]: newRatio, [dividerKey]: 1}
        }else{
            newMultiplier = existingTaskEstimate[multiplierKey] + newRatio;
            newDivider = existingTaskEstimate[dividerKey] + 1;

            updatedData = {[multiplierKey]: newMultiplier, [dividerKey]: newDivider}
        }

        const taskEstimate = await prisma.taskEstimate.update({
            where: {
                id
            },
            data: updatedData
        });

        return NextResponse.json(taskEstimate, { status: 200 });

    } catch (error) {
        console.error(error.stack);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}
  
// get taskEstimate
export async function GET(request, { params }) {
    try {
        const userId = (await params).accountId;
        const { difficulty } = await request.json();

        const multiplierKey = `multiplier${difficulty}`;
        const dividerKey = `divider${difficulty}`;

        const fields = {
            [multiplierKey]: true,
            [dividerKey]: true
        }

        const taskEstimate = await prisma.taskEstimate.findUnique({
            where: {
                userId
            },
            select: fields
        });

        return NextResponse.json(taskEstimate, { status: 200 });
    } catch (error) {
        console.error(error.stack);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}
