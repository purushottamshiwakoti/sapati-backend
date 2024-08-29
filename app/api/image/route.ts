import { NextRequest, NextResponse } from "next/server";

import cloudinary from "cloudinary";
import multer from "multer";
import { uploadImage } from "@/actions/upload";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const image = data.get("image");

    const datas = await uploadImage(data);

    return NextResponse.json({ message: "yess" });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
