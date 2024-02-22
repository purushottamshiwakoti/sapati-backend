import { PersonIcon } from "@radix-ui/react-icons";
import { LayoutDashboard, ShieldCheck } from "lucide-react";

export const adminNavs=[
    {
        name:"Dashboard",
        href:"/dashboard",
        icon:LayoutDashboard
    },
    {
        name:"Admins",
        href:"/admins",
        icon:ShieldCheck,
        superAdmin:true
    },
    {
        name:"Users",
        href:"/users",
        icon:PersonIcon,
      
    }
]