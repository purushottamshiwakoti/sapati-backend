import prismadb from "./prismadb";

export const getAdminByEmail=async(email:string)=>{
    try {

        const admin=await prismadb.admin.findUnique({
            where:{
                email
            }
        });

        return admin
        
    } catch (error) {
        return null;
    }

}
export const getAdminById=async(id:string)=>{
    try {

        const admin=await prismadb.admin.findUnique({
            where:{
                id
            }
        });

        return admin
        
    } catch (error) {
        return null;
    }

}