import { cn } from "@/lib/utils";
import { DollarSign, LucideIcon } from "lucide-react";

export const StatusCard = ({
  className,
  title,
  amount,
  description,
  icon: Icon,
}: {
  className?: any;
  title: string;
  amount: string;
  description: string;
  icon: LucideIcon;
}) => {
  return (
    <>
      <div className={cn(" p-6 shadow-md border rounded-xl", className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{title}</h3>
          <Icon className="w-4 h-4 text-zinc-700" />
        </div>
        <h2 className="mt-2 mb-2 text-2xl font-bold">{amount}</h2>
        <p className="text-zinc-500 text-sm ">{description}</p>
      </div>
    </>
  );
};
