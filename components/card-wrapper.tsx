import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const CardWrapper = ({
  className,
  children,
  title,
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <div className={cn(className)}>
        <Card className="rounded-3xl p-1 bg-white/80 shadow-xl">
          <CardHeader>
            <CardTitle className="text-primary/80 text-center font-bold ">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </>
  );
};
