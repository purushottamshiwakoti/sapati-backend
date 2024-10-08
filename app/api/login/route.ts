import { getUserByPhone } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { generateBearerToken } from "@/lib/tokens";
import prismadb from "@/lib/prismadb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone_number, password, device_token, country_code } = body;

    const requiredFields = [
      { field: phone_number, fieldName: "Phone number " },
      { field: country_code, fieldName: "Country Code " },
      { field: password, fieldName: "Password" },
      { field: device_token, fieldName: "Device Token" },
    ];
    const errors: any = [];

    requiredFields.forEach(({ field, fieldName }) => {
      if (!field) {
        errors.push(`${fieldName} is required`);
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 499 });
    }

    const phone = parseInt(phone_number);

    const existingUser = await getUserByPhone(phone);

    if (!existingUser) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }
    if (!existingUser.is_verified) {
      return NextResponse.json(
        { message: "User does not exists " },
        { status: 404 }
      );
    }
    if (!existingUser.password) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }
    const checkPassword = await bcrypt.compare(password, existingUser.password);

    if (!checkPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 403 }
      );
    }

    const token = await generateBearerToken(existingUser.id);

    await prismadb.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        device_token,
      },
    });

    return NextResponse.json(
      { message: "Successfully logged in", token: token },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
