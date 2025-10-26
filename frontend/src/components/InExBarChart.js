import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { ChartLegend, ChartLegendContent } from "./ui/chart";
import { ChartContainer } from "./ui/chart"; // No type imports in JS
import { Navigate } from "react-router-dom";

import { API_URL } from "../lib/utils";

const user = JSON.parse(localStorage.getItem("user"));
const user_id = user?.id; // ohne Token nur der user

// const chartData = [
// { month: "January", expenses: 186, income: 80 },
// { month: "February", expenses: 305, income: 200 },
// { month: "March", expenses: 237, income: 120 },
// { month: "April", expenses: 73, income: 190 },
// { month: "May", expenses: 209, income: 130 },
// { month: "June", expenses: 214, income: 140 },
// ];

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: " #F5C858", //  #FBBF24",
  },
  income: {
    label: "Income",
    color: " #0489A9",
  },
};

const InExBarChart = () => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString();

  const [chartData, setChartData] = useState([
    { month: "", expenses: 0, income: 0 },
  ]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const user_id = user?.id; // ohne Token nur der user
    if (!user_id) return; // User not logged in || !month) return;

    const fetchChartData = async () => {
      const payload = {
        year: parseFloat(year),
        month: parseFloat(month),
      };

      try {
        const res = await fetch(`${API_URL}/barchartdata/${user_id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          setChartData(data); // Update bar chart data
        } else {
          const err = await res.json();
          console.error("Backend error:", err.error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchChartData();
  }, [year, month]); // Runs whenever year or month changes

  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return (
    <>
      <ChartContainer
        config={chartConfig}
        className="max-h-[400px] max-w-[800px]"
      >
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          <Bar dataKey="income" fill="var(--color-income)" radius={4} />
        </BarChart>
      </ChartContainer>
    </>
  );
};

export default InExBarChart;
