"use server";
import { utapi } from "@/server/uploadthing";

export const uploadImage = async (imageFile: FormData) => {
  try {
    const image = await utapi.uploadFiles(imageFile);

    return image.data?.url;
  } catch (error) {
    return null;
  }
};
