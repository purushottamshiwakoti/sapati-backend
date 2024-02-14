import { LayoutDashboard, ShieldCheck, UsersRound } from "lucide-react";

export const adminNavs=[
    {
        title:"Menu",
        navs:[
            {
                name:"Overview",
                icon:LayoutDashboard,
                href:"/admin/dashboard"
            },
            {
                name:"Users",
                icon:UsersRound,
                href:"/admin/users"
            },
            {
                name:"Admins",
                icon:ShieldCheck,
                href:"/admin/adminss"
            },
        ]
    }
]