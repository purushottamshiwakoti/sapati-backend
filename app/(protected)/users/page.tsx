import prismadb from "@/lib/prismadb";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

async function getData(s?: any) {
  const user = prismadb.user.findMany({
    where: {
      first_name: {
        startsWith: s,
      },
    },
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
    last_name: item.last_name,
    phone_number: item.phone_number,
    is_verified: item.is_verified,
    total_borrowings: item.borrowings.length,
    total_lendings: item.lendings.length,
  }));
  return (
    <div className="p-2">
      <div className="lg:mx-2">
        <DataTable columns={columns} data={data} searchKey="first_name" />
      </div>
    </div>
  );
};

export default UsersPage;
