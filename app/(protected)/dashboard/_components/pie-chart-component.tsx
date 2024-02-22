"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export function PieChartComponent({ data }: { data: any }) {
  return (
    <>
      <div className="lg:h-[28rem] lg:w-[30%] lg:ml-10 bg-white rounded-xl border">
        <Pie data={data} />
      </div>
    </>
  );
}
