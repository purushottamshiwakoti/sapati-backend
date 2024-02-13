import prismadb from "./prismadb";

export const getSapatiById=async(id:string)=>{
    try {

        const sapati=await prismadb.sapati.findUnique({
            where:{
                id
            },
            include:{
               borrowings:true,
               lendings:true 
            }
        });

        return sapati
        
    } catch (error) {
        return null;
    }
}


