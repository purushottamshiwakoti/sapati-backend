"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type LendBorrow = {
  from: string | null;
  amount: number;
  status: string;
  takenDate: Date;
  returnDate: Date;
  isSettled: boolean;
};

export const columns: ColumnDef<LendBorrow>[] = [
  {
    accessorKey: "from",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "isSettled",
    header: "Settled Status",
  },
  {
    accessorKey: "takenDate",
    header: "Taken Date",
  },
  {
    accessorKey: "returnDate",
    header: "Return Date",
  },
];
