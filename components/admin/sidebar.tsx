"use client";

import { adminNavs } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

import { Separator } from "@/components/ui/separator";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DialogClose } from "@radix-ui/react-dialog";
import { useGetCurrentUser } from "@/hooks/use-get-current-user";

export const Sidebar = () => {
  const path = usePathname();
  return (
    <>
      <div className="block lg:hidden p-1 mt-5">
        <Sheet>
          <SheetTrigger>
            <Menu />
          </SheetTrigger>
          <SheetContent side={"left"}>
            <SheetHeader>
              <SheetDescription className="p-2 mt-10">
                <div className=" space-y-2 flex flex-col">
                  {adminNavs.map((item, index) => (
                    <DialogClose asChild key={index}>
                      <Button
                        className={cn(
                          "flex items-start justify-start   w-full"
                        )}
                        variant={path.includes(item.href) ? "default" : "ghost"}
                        asChild
                        key={index}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center justify-center"
                        >
                          <item.icon className="h-5 w-5 mr-2 " />
                          <div className="">{item.name}</div>
                        </Link>
                      </Button>
                    </DialogClose>
                  ))}
                </div>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <div className=" shadow-md h-screen dark:shadow-white lg:w-[14rem] lg:block hidden sticky top-0 ">
        {/* project name  start */}

        <div className="w-full flex items-center lg:justify-center justify-start lg:p-4 p-1 gap-2 border-b-[0.5px] border-[#C8CBD9]">
          <Button
            className="w-full border-2 flex items-start justify-start"
            variant={"outline"}
          >
            <div className="flex items-center justify-between w-full truncate">
              Sapati Dashboard
              {/* <ChevronsUpDown className="w-4 h-4 text-zinc-400" /> */}
            </div>
          </Button>
        </div>

        {/* project name  end */}

        {/* menu start  */}
        <div className="lg:p-2 mt-3 p-1">
          {/* menus  */}
          <div className=" space-y-2 flex flex-col">
            {adminNavs.map((item, index) => (
              <>
                <Button
                  className={cn(
                    "lg:flex lg:items-start lg:justify-start   w-full"
                  )}
                  variant={path.includes(item.href) ? "default" : "ghost"}
                  asChild
                  key={index}
                >
                  <Link
                    href={item.href}
                    className="flex items-center justify-center"
                  >
                    <item.icon className="h-5 w-5 mr-2 " />
                    <div className="lg:block hidden">{item.name}</div>
                  </Link>
                </Button>
                <Separator />
              </>
            ))}
            {/* <Button
            className="flex items-start justify-start text-[#717e86] hover:text-[#5a67ba] text-lg"
            variant={"ghost"}
          >
            Hello
          </Button>
          <Button
            className="flex items-start justify-start bg-[#e4e7f4]  text-[#5a6acf] hover:text-[#5a67ba] text-lg"
            variant={"ghost"}
          >
            Hello
          </Button> */}
          </div>
        </div>
      </div>
    </>
  );
};
