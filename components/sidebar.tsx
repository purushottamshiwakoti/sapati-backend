"use client";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { adminNavs } from "@/lib/nav";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
  const path = usePathname();
  console.log(path);

  return (
    <>
      <div className="w-[15rem]  bg-white/70 shadow-xl border-r-1 h-[calc(100vh-1rem)] p-4  border-black rounded-r-md sticky top-0">
        <div className="flex items-center justify-center w-full">
          <div className="relative  w-20 h-20  ">
            <Image src={"/logo.svg"} alt="logo" fill />
          </div>
        </div>
        <Separator className="mt-1" />
        <div>
          {adminNavs.map((item) => (
            <div key={item.title} className="mt-4">
              <h2 className="mb-2 ml-2 text-muted-foreground">{item.title}</h2>
              <div className="space-y-5">
                {item.navs.map((nav) => (
                  <div key={nav.name} className="space-y-3">
                    <Button
                      variant={path.includes(nav.href) ? "default" : "outline"}
                      className="w-full flex items-center justify-start rounded-sm"
                      asChild
                    >
                      <Link href={nav.href}>
                        <nav.icon className="w-5 h-5 mr-2" />
                        {nav.name}
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
