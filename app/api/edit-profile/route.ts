import { deleteImage, uploadImage } from "@/actions/upload";
import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const token = await req.headers;

    const bearerToken = token.get("Authorization")?.split(" ")[1];
    const existingToken = await verifyBearerToken(bearerToken);

    if (!existingToken) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const data = await req.formData();
    const image: any = data.get("image");
    const first_name: any = data.get("first_name");
    const last_name: any = data.get("last_name");
    const email: any = data.get("email");
    const dob: any = data.get("dob");
    const gender: any = data.get("gender");
    let userImage;

    console.log(dob);
    const requiredFields = [
      { field: first_name, fieldName: "First Name" },
      { field: last_name, fieldName: "Last Name" },
    ];
    const errors: any = [];

    requiredFields.forEach(({ field, fieldName }) => {
      if (!field) {
        errors.push(`${fieldName} is required`);
      }
    });

    if (image !== null) {
      // Check if the image size is greater than 2MB
      const MAX_IMAGE_SIZE_MB = 3;
      const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

      if (image.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `Image size must not exceed ${MAX_IMAGE_SIZE_MB}MB` },
          { status: 400 }
        );
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }

    const user = await getUserById(existingToken.user_id);

    if (!user) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 403 }
      );
    }

    if (image !== null) {
      userImage = await uploadImage(image);
    }

    if (user.image !== null) {
      await deleteImage(user.image);
    }

    const updateData: any = {
      first_name,
      last_name,
      email,
      dob: dob || null, // If dob is an empty string, set it to null
      gender: gender || null, // If gender is an empty string or null, set it to null
    };
    console.log(updateData);
    if (userImage !== null) {
      updateData.image = userImage;
    }

    const newUser = await prismadb.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Successfully updated profile", newUser },
      { status: 200 }
    );
  } catch (error) {
    console.error({ error });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
