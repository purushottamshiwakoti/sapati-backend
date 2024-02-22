"use client";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { faker } from "@faker-js/faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Real Time Data ",
    },
  },
};


export function BarChart({ data }: { data: any }) {
  return (
    <>
      <div className="lg:h-[28rem] lg:w-[60%] rounded-md border-2 dark:bg-white">
        <Bar options={options} data={data} />
      </div>
    </>
  );
}
