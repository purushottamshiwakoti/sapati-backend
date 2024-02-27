import prismadb from "@/lib/prismadb";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

async function getData(s?: any) {
  // Convert the input string to a number, if possible
  const phoneNumber = s ? parseInt(s) : undefined;

  if (s != null) {
    console.log(typeof phoneNumber);
    const user = await prismadb.user.findUnique({
      where: {
        phone_number: phoneNumber,
      },
      include: {
        borrowings: true,
        lendings: true,
      },
    });

    return user ? [user] : []; // Ensure an array is returned
  }

  const user = prismadb.user.findMany({
    include: {
      borrowings: true,
      lendings: true,
    },
  });
  return user;
}
const UsersPage = async ({ searchParams }: { searchParams: any }) => {
  const usersData = await getData(searchParams.s);
  const data = usersData.map((item) => ({
    id: item.id,
    first_name: item.first_name,
    country_code: item.country_code,
    last_name: item.last_name,
    phone_number: item.phone_number,
    is_verified: item.is_verified,
    total_borrowings: item.borrowings.length,
    total_lendings: item.lendings.length,
  }));
  return (
    <div className="p-2">
      <div className="lg:mx-2">
        <DataTable columns={columns} data={data} searchKey="phone_number" />
      </div>
    </div>
  );
};

export default UsersPage;
