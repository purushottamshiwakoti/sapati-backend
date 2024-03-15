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
      
    },
    {
        name:"Terms and conditions",
        href:"/create-terms-and-conditions",
        icon:PersonIcon,
      
    },
    {
        name:"Privacy Policy",
        href:"/create-privacy-policy",
        icon:PersonIcon,
      
    },
]