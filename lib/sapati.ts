import prismadb from "./prismadb";

export const getSapatiById=async(id:string)=>{
    try {

        const sapati=await prismadb.sapatiRequests.findUnique({
            where:{
                id
            }
        });

        return sapati
        
    } catch (error) {
        return null;
    }
}