import prismadb from "@/lib/prismadb";
import { getUserByPhone } from "@/lib/user";
import { verifyBearerToken } from "@/lib/verifyBearerToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        const {fullName,phone,amount,taken_date,return_date,remarks,type}=await req.json()

        const requiredFields = [
            { field: fullName, fieldName: 'Full Name' },
            { field: phone, fieldName: 'Phone ' },
            { field: amount, fieldName: 'Amount' },
            { field: taken_date, fieldName: 'Taken Date' },
            { field: return_date, fieldName: 'Return Date' },
            { field: type, fieldName: 'Type' },
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

        const phone_number=parseInt(phone);

        let newUser;

        const existingUser=await getUserByPhone(phone_number);
        console.log(existingUser)

        if(!existingUser){
          newUser=  await prismadb.user.create({
                data:{
                    phone_number,
                    fullName
                }
            })
        }

        const token=await req.headers

        const bearerToken=token.get("Authorization")?.split(" ")[1]

        const existingToken=await verifyBearerToken(bearerToken)
        if(!existingToken){
            return NextResponse.json({message:"Invalid token"},{status:498})
        }

        console.log(existingToken.user_id==existingUser?.id);
        console.log(existingUser);
        console.log(newUser);

        console.log(existingToken)

if(existingToken.user_id===existingUser?.id){
    return NextResponse.json({message:"You cannot perform this action"},{status:403});
}
        if (type == "LENDED" && newUser !== undefined) {
            const sapati = await prismadb.sapati.create({
                data: {
                    amount,
                    phone,
                    return_date,
                    taken_date,
                    fullName,
                    type,
                    remarks,
                    lendings: {
                create:{
                      user:{
                             connect:{
                            //    id:newUser.id,
                               id:newUser.id,
                                   }
                                 }
                            }
                    },
                    borrowings:{
                       create:{
                       user_id:existingToken.user_id
                       }
                    }
                }
            });
        return NextResponse.json({message:"Successfully added lending"},{status:200});

        }

        if (type == "LENDED" && existingUser !== null) {
            const sapati = await prismadb.sapati.create({
                data: {
                    amount,
                    phone,
                    return_date,
                    taken_date,
                    fullName,
                    type,
                    remarks,
                    lendings: {
                        create:{
                            user:{
                                connect:{
                                    // id:existingToken.user_id
                                    id:existingUser.id
                                }
                            }
                        }
                    },
                    borrowings:{
                        create:{
                         user_id:existingToken.user_id
                        }
                     }
                }
            });
        return NextResponse.json({message:"Successfully added lending"},{status:200});

        }

        if (type == "BORROWED" && newUser !== undefined) {
            const sapati = await prismadb.sapati.create({
                data: {
                    amount,
                    phone,
                    return_date,
                    taken_date,
                    fullName,
                    type,
                    remarks,
                    borrowings: {
                       create:{
                        user:{
                            connect:{
                                // id:newUser.id
                                id:existingToken.user_id
                            }
                        }
                       }
                    },lendings:{
                        create:{
                            user_id:newUser.id
                           }
                    }
                }
            });
        return NextResponse.json({message:"Successfully added borrowing"},{status:200});

        }
        
        if (type == "BORROWED" && existingUser !== null) {
            const sapati = await prismadb.sapati.create({
                data: {
                    amount,
                    phone,
                    return_date,
                    taken_date,
                    fullName,
                    type,
                    remarks,
                    borrowings: {
                        create:{
                         user:{
                             connect:{
                                 id:existingUser.id
                                //  id:existingToken.user_id
                             }
                         }
                        }
                     },lendings:{
                         create:{
                             user_id:existingToken.user_id
                            }
                     }
                }
            });
        return NextResponse.json({message:"Successfully added borrowing"},{status:200});

        }


        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}