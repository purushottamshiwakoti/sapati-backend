import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const bearerToken = await prismadb.bearerToken.findFirst({
    where: {
      token: token,
    },
  });

  if (!bearerToken) {
    return NextResponse.json({ message: "Token not found" });
  }
  try {
    await prismadb.user.update({
      where: {
        id: bearerToken.user_id,
      },
      data: {
        device_token: "",
      },
    });
    await prismadb.bearerToken.delete({
      where: {
        id: bearerToken.id,
      },
    });

    return NextResponse.json(
      { message: "Successfully logged out" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
