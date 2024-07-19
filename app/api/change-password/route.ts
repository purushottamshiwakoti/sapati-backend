import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismadb";
import { getUserById, getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    const { current_password, new_password, confirm_new_password } = body;

    const token = await req.headers;

    const bearerToken = token.get("Authorization")?.split(" ")[1];

    const existingToken = await verifyBearerToken(bearerToken);
    if (!existingToken) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    if (!existingToken) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 403 }
      );
    }

    const requiredFields = [
      { field: current_password, fieldName: "Current Password" },
      { field: new_password, fieldName: "New Password" },
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
        { status: 401 }
      );
    }

    const user = await getUserById(existingToken.user_id);

    if (!user) {
      return NextResponse.json(
        { message: "User doesnot exists" },
        { status: 403 }
      );
    }

    if (user.password) {
      const checkPassword = await bcrypt.compare(
        current_password,
        user.password
      );
      if (!checkPassword) {
        return NextResponse.json(
          { message: "Current password does not match " },
          { status: 400 }
        );
      }
      const samePassword = await bcrypt.compare(
        confirm_new_password,
        user.password
      );
      if (samePassword) {
        return NextResponse.json(
          { message: "Passowrd cannot be same" },
          { status: 400 }
        );
      }
    }

    // Password validation
    // const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&\.])[A-Za-z\d@$!%*#?&\.]{8,}$/;
    if (!passwordRegex.test(new_password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters long and contain at least one number, one special character, and one capital letter.",
        },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prismadb.user.update({
      where: {
        id: existingToken.user_id,
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
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
