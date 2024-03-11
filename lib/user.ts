import prismadb from "./prismadb";


export const getUserByPhone=async(phone:number)=>{
    try {

        console.log(phone);

        
        const user=await prismadb.user.findUnique({
            where:{
                phone_number:phone
            }
        });

        console.log(user);
        return user;
        
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const getUserById=async(id:string)=>{
    try {
        console.log(id);

        const user=await prismadb.user.findUnique({
            where:{
                id
            }
        });

        return user;
        
    } catch (error) {
        console.log(error);
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