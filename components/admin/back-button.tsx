import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export const BackButton = ({
  title,
  href,
}: {
  title: string;
  href: string;
}) => {
  return (
    <>
      <Button variant={"outline"} asChild>
        <Link href={href}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          {title}
        </Link>
      </Button>
    </>
  );
};
