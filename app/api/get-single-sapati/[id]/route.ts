import { getSapatiById } from "@/lib/sapati";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, params: any) {
  try {
    const token = await req.headers;

    const bearerToken = token.get("Authorization")?.split(" ")[1];

    const existingToken = await verifyBearerToken(bearerToken);
    if (!existingToken) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const id = params.params.id;
    const sapati = await getSapatiById(id);

    if (!sapati) {
      return NextResponse.json({ message: "No sapati found" }, { status: 404 });
    }

    const borrowerId = sapati.borrowings?.user_id;
    const lenderId = sapati.lendings?.user_id;

    if (
      existingToken.user_id !== lenderId &&
      existingToken.user_id !== borrowerId
    ) {
      return NextResponse.json({ message: "No sapati found" }, { status: 403 });
    }

    return NextResponse.json({ message: sapati }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
