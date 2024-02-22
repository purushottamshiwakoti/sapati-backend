import React from "react";
import { DashboardCard } from "./_components/dashboard-card";
import { StatusCard } from "./_components/status-card";
import {
  Activity,
  Banknote,
  CreditCard,
  DollarSign,
  HandCoins,
  Users2,
  UsersRound,
} from "lucide-react";
import { BarChart } from "./_components/barchart";
import { PieChartComponent } from "./_components/pie-chart-component";
import prismadb from "@/lib/prismadb";

async function getData() {
  const user = prismadb.user.aggregate({
    _count: {
      _all: true,
    },
  });
  const borrowings = prismadb.borrowings.aggregate({
    _count: {
      _all: true,
    },
  });
  const lendings = prismadb.lendings.aggregate({
    _count: {
      _all: true,
    },
  });
  const sapati = prismadb.sapati.aggregate({
    _count: {
      _all: true,
    },
  });

  const data = {
    totalUsers: (await user)._count._all,
    totalBorrowings: (await borrowings)._count._all,
    totalLendings: (await lendings)._count._all,
    totalSapati: (await sapati)._count._all,
  };

  return data;
}

const DashboardPage = async () => {
  const data = await getData();

  const pieChartData = {
    labels: ["Sapatis", "Users", "Borrowings", "Lendings"],
    datasets: [
      {
        label: "# Total Number",
        data: [
          data.totalSapati,
          data.totalUsers,
          data.totalBorrowings,
          data.totalLendings,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const labels = ["Users", "Sapatis", "Lendings", "Borrowings"];
  const barChartDdata = {
    labels,
    datasets: [
      {
        label: "Total Numbers",
        data: [
          data.totalUsers,
          data.totalSapati,
          data.totalBorrowings,
          data.totalLendings,
        ],
        backgroundColor: "black",
      },
    ],
  };
  return (
    <div className="md::p-5 p-2">
      <DashboardCard />
      <div className="mt-5 gap-4 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
        <StatusCard
          title="Total Users"
          icon={UsersRound}
          amount={`+ ${data.totalUsers}`}
          description="Users are increasing day by day"
        />
        <StatusCard
          title="Total Lendings"
          icon={HandCoins}
          amount={`+ ${data.totalLendings}`}
          description="Users are lending too!"
        />
        <StatusCard
          title="Total Borrowings"
          icon={Banknote}
          amount={`+ ${data.totalBorrowings}`}
          description="Users are borrowing too!"
        />
        <StatusCard
          title="Total Sapatis"
          icon={Activity}
          amount={`+ ${data.totalSapati}`}
          description="Sapatis are increasing day by day"
        />
      </div>

      <div className="mt-10 lg:flex space-y-4 lg:space-y-0">
        <BarChart data={barChartDdata} />
        <PieChartComponent data={pieChartData} />
      </div>
    </div>
  );
};

export default DashboardPage;
