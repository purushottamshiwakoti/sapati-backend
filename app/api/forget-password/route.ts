import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismadb";
import { getUserByPhone } from "@/lib/user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { new_password, confirm_new_password, phone_number } = body;

    const requiredFields = [
      { field: new_password, fieldName: "New Password" },
      { field: phone_number, fieldName: "Phone " },
      { field: confirm_new_password, fieldName: "Confirm new password" },
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

    if (new_password !== confirm_new_password) {
      return NextResponse.json(
        { message: "Password does not match" },
        { status: 400 }
      );
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&\.])[A-Za-z\d@$!%*#?&\.]{8,}$/;
    if (!passwordRegex.test(new_password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters long and contain at least one number, one special character, and one capital letter.",
        },
        { status: 400 }
      );
    }

    const phone = parseInt(phone_number);

    const user = await getUserByPhone(phone);

    if (!user) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 403 }
      );
    }
    if (!user.is_verified) {
      return NextResponse.json(
        { message: "User is not verified" },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prismadb.user.update({
      where: {
        phone_number: phone,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Successfully updated password" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
