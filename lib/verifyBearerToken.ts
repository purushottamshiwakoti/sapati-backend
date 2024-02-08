import prismadb from "./prismadb"

export const verifyBearerToken=async(token:any)=>{
    try {
        console.log(token);
        const existingToken=await prismadb.bearerToken.findUnique({
            where:{
                token
            }
        });
        console.log(existingToken);
        return existingToken

        
    } catch (error) {
        console.log(error);
        return null
        
    }

}