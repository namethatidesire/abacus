import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const { accountId } = await request.json();
		const account = await prisma.user.findUnique({
			where: { id: accountId },
			include: { events: true },
		});

		if (!account) {
			return NextResponse.forbidden({ message: "Account not found" });
		}

		return NextResponse.json({ account, username: account.username }, { status: 200 });
	} catch (error) {
		console.log(error.stack)
		return NextResponse.error(error);
	}
}
