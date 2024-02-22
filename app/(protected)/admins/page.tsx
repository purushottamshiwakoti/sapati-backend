import { AddButton } from "@/components/admin/add-button";
import React from "react";
import { User, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import prismadb from "@/lib/prismadb";

async function getData(s?: any): Promise<User[]> {
  const user = prismadb.admin.findMany({
    where: {
      email: {
        startsWith: s,
      },
    },
  });

  return user;
}

const UsersPage = async ({ searchParams }: { searchParams: any }) => {
  const data = await getData(searchParams.s);

  return (
    <div className="p-2">
      <div>
        <AddButton title="Add User" href="/admins/add" />
      </div>
      <div className="lg:mx-2">
        <DataTable columns={columns} data={data} searchKey="email" />
      </div>
    </div>
  );
};

export default UsersPage;
