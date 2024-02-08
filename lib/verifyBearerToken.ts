import prismadb from "./prismadb"

export const verifyBearerToken=async(token:any)=>{
    try {
        const existingToken=await prismadb.bearerToken.findUnique({
            where:{
                token
            }
        });
        return existingToken

        
    } catch (error) {
        return null
        
    }

}