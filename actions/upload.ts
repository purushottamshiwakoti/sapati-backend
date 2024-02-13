"use server"
import { utapi } from "@/server/uploadthing";

export const deleteImage = async (image:string) => {
  console.log(image);
  await utapi.deleteFiles(image);
}

export const uploadImage = async (imageFile:FormData) => {
    try {
      
     const image= await utapi.uploadFiles(imageFile)
     console.log(image.data?.url);

     return image.data?.url
    } catch (error) {
      console.log(error)
      return null;
    }
    }
    
