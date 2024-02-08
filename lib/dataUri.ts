import DataURIParser from "datauri/parser"; 
import path from "path";


const getDataUri=async(file:any)=>{
    const parser=new DataURIParser();
    const extName=path.extname(file.name).toString();
    console.log(extName)
   return parser.format(extName,file.content)


}

export default getDataUri