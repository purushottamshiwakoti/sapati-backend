import { deleteImage, uploadImage } from "@/actions/upload";
import prismadb from "@/lib/prismadb";
import { getUserById } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest){
    try {
        const token=await req.headers

        const bearerToken=token.get("Authorization")?.split(" ")[1]

        const existingToken=await verifyBearerToken(bearerToken)
        if(!existingToken){
            return NextResponse.json({message:"Invalid token"},{status:400})
        }

const data=await req.formData();
const image:any=data.get('image');
const first_name:any=data.get('first_name');
const last_name:any=data.get('last_name');
const email:any=data.get('email');
const dob:any=data.get('dob');
const gender:any=data.get('gender');
let userImage;



        // const {first_name,last_name,gender,email,dob}=body;

        const requiredFields = [
            { field: first_name, fieldName: 'First Name' },
            { field: last_name, fieldName: 'Last Name ' },
        ];
        const errors:any = [];

        requiredFields.forEach(({ field, fieldName }) => {
            if (!field) {
                errors.push(`${fieldName} is required`);
            }
        });

        if (errors.length > 0) {
            return NextResponse.json({ error:errors[0] }, { status: 499 });
        }

        const user=await getUserById(existingToken.user_id);

       

        if(image!==null){
            userImage= await uploadImage(image)
            
          }

        if(!user){
            return NextResponse.json({message:"User does not exists"},{status:403})
        }

        if(user.image!==null){
            const abc=await deleteImage(user.image)
            console.log(abc)
        }
        console.log(userImage)
      if(userImage!==null){
        const newUser= await prismadb.user.update({
            where:{
                id:user.id
            },
            data:{
                first_name,
                last_name,
                gender,
                email,
                image:userImage,
                dob
            }
        })

        return NextResponse.json({message:"Successfully updated profile",newUser},{status:200})
      }
      if(dob==""){
        
      }
      const newUser= await prismadb.user.update({
        where:{
            id:user.id
        },
        data:{
            first_name,
            last_name,
            gender,
            email,
            dob
        }
    })

    return NextResponse.json({message:"Successfully updated profile",newUser},{status:200})
        



        
    } catch (error) {
        console.log({error});
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Prisma client error, extract more details
            console.error("Prisma Error:", error.message);
            
                return NextResponse.json({ error: error.message }, { status: 500 });
            // Handle other Prisma errors as needed
        }
    
        return NextResponse.json({ error: error || "Internal Server Error" }, { status: 500 });
        
    }

}