import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

// create taskEstimate for the new user
export async function POST(request) {
    try {
        const { userId } = await request.json();
        
        const taskEstimate = await prisma.taskEstimate.create({
            data: {
                userId, // Ensure the userId field is correctly assigned here
                multiplier1: 1,
                multiplier2: 1,
                multiplier3: 1,
                multiplier4: 1,
                multiplier5: 1,
                divider1: 0,
                divider2: 0,
                divider3: 0,
                divider4: 0,
                divider5: 0,
            }
        });

        return NextResponse.json({ taskEstimate }, { status: 201 });
    } catch (error) {
        console.error('Error creating task estimate for new user:', error);
        throw error;
    }
}

