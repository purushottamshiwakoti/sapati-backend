import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export const Sidebar = () => {
  return (
    <>
      <div className="w-[15rem]  bg-white/70 shadow-xl border-r-1 h-[calc(100vh-1rem)] p-4  border-black  sticky top-0">
        <div className="flex items-center justify-center w-full">
          <div className="relative  w-20 h-20  ">
            <Image src={"/logo.svg"} alt="logo" fill />
          </div>
        </div>
        <Separator className="mt-1" />
      </div>
    </>
  );
};
