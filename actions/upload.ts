"use server"
import { utapi } from "@/server/uploadthing";

export const deleteImage = async (id:string) => {
const url=id.split("/")
  await utapi.deleteFiles(url[url.length-1]);
}

export const uploadImage = async (imageFile:FormData) => {
    console.log(imageFile);

     const abc= await utapi.uploadFiles(imageFile)
     console.log(abc);
    }
    
