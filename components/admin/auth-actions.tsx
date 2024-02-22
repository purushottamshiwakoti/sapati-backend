"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { logout } from "@/actions/admin";

export const AuthActions = ({ name }: { name?: string | undefined | null }) => {
  return (
    <>
      <DropdownMenu>
        <Button asChild variant={"outline"} className="p-2">
          <DropdownMenuTrigger>
            <div className="flex items-center justify-center  dark:text-white   text-[#1f384c]">
              <div className="lg:text-md text-sm truncate flex items-center ml-2">
                <h2 className="max-w-sm truncate">{name}</h2>
                <ChevronsUpDown className="w-5 h-5  lg:ml-2" />
              </div>
            </div>
          </DropdownMenuTrigger>
        </Button>
        <DropdownMenuContent className="lg:w-[20rem]">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={"/change-password"} className="cursor-pointer">
              Change Password
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
