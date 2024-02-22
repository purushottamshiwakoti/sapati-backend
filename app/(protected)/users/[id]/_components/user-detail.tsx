import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

export const UserDetail = ({ data }: { data: any }) => {
  console.log(data);
  return (
    <div className="bg-white dark:bg-gray-800 p-4 shadow-xl mx-10 rounded-2xl">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">User Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">User Id:</h3>
            <Input disabled value={data?.id} />
          </div>
          <div>
            <h3 className="font-semibold">First Name:</h3>
            <Input disabled value={data?.first_name} />
          </div>
          <div>
            <h3 className="font-semibold">Last Name:</h3>
            <Input disabled value={data?.last_name} />
          </div>
          <div className="flex  gap-4">
            <h3 className="font-semibold">Image:</h3>
            {data.iamge && (
              <div className="w-32 h-32 rounded-full overflow-hidden">
                <Image
                  src={data?.image}
                  alt="User Image"
                  layout="responsive"
                  width={200}
                  height={200}
                />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">Verified Status:</h3>
            <Input disabled value={data?.is_verified ? "Yes" : "No"} />
          </div>
          <div>
            <h3 className="font-semibold">Phone Number:</h3>
            <Input disabled value={data?.phone_number} />
          </div>
          <div>
            <h3 className="font-semibold">
              Total Borrowings: {data?.borrowings.length}
            </h3>
            <Button className="mt-1" variant={"outline"} asChild>
              <Link href={`/users/${data.id}/borrowings`}>View Borrowings</Link>
            </Button>
          </div>
          <div>
            <h3 className="font-semibold">
              Total Lendings: {data?.lendings.length}
            </h3>
            <Button className="mt-1" variant={"outline"} asChild>
              <Link href={`/users/${data.id}/lendings`}>View Lendings</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
