import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";
import { comparePassword, generateToken} from "@/utils/auth";

export async function POST(request) {
  const { username, password } = await request.json();
  //Check if the input fields are valid
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json(
      { message: "Invalid username or password" },
      { status: 400 },
    );
  }
  //Using the input values, find the user in the database
  const user = await prisma.user.findUnique({
    where: { username },
  });
  //If the user does not exist or if the password is incorrect, return an error
  if (!user) {
    return NextResponse.json(
      { message: "User does not exist" },
      { status: 401 },
    );
  }else if (!comparePassword(password, user.password)){
    return NextResponse.json(
      { message: "Incorrect password" },
      { status: 401 },
    );
  }
  //If the user exists and the password is correct, generate a token
  const token_user = { userId: user.id };
  const token = generateToken(token_user);

  //Send this token to the client to be stored in the browser
  return NextResponse.json(
    { message: "Successfully logged in", token: token },
    { status: 201 },
  );
}
