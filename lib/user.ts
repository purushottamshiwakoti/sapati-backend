import prismadb from "./prismadb";


export const getUserByPhone=async(phone:number)=>{
    try {

        const user=await prismadb.user.findUnique({
            where:{
                phone_number:phone
            }
        });

        return user;
        
    } catch (error) {
        return null;
    }
}

export const getUserById=async(id:string)=>{
    try {

        const user=await prismadb.user.findUnique({
            where:{
                id
            }
        });

        return user;
        
    } catch (error) {
        return null;
    }
}

export const getVerificationTokenByPhone=async(phone_number:number)=>{
    try {

        const token=await prismadb.verifyPhoneNumber.findFirst({
            where:{
                phone_number
            }
        });

        return token;
        
    } catch (error) {
        return null;
    }
}