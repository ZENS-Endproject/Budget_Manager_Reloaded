import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Form, FormControl, FormItem, FormLabel } from "./ui/form";
import { Select, SelectItem } from "./ui/select";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the plugin
import { API_URL } from "../lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);
const token = localStorage.getItem("token");
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        boxWidth: 40,
        padding: 15,
      },
    },
    datalabels: {
      color: "black", // Color of the data labels
      font: {
        // weight: "bold",
        size: 12,
      },
      formatter: (value, context) => {
        if (value === 0) return ""; // Hide zero amounts
        return `€${value.toFixed(2)}`; // Format as currency
      },
      align: "start", // Align the labels in the center
      anchor: "end", // Anchor them in the center of each segment
    },
  },
};

const PieChart = () => {
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = (now.getMonth() + 1).toString();

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  });
  // Es gibt kein submit Button -->   "watch" weil  UseForm reagiert auf Änderungen
  const { register, watch } = useForm({
    defaultValues: {
      year: currentYear,
      month: currentMonth,
    },
  });

  const year = watch("year");
  const month = watch("month");

  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user?.id; // ohne Token nur der user

  useEffect(() => {
    const fetchChartData = async () => {
      if (!year || !month) return;

      const payload = {
        year: parseFloat(year),
        month: parseFloat(month),
      };
      try {
        const res = await fetch(`${API_URL}/piedata/${user_id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          setChartData(data); // Update pie chart data
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

  const isChartEmpty = chartData && chartData.labels.length === 0;

  return (
    <>
      <div style={styles.chartBox}>
        <div className="max-h-[400px] max-w-[800px] p-4 bg-white rounded shadow piechart">
          {isChartEmpty ? (
            <p style={{ color: "red" }}>
              No expenses available for the selected month and year.
            </p>
          ) : (
            <Pie data={chartData} options={options} width={400} height={400} />
          )}
        </div>

        <Form className="p-4 rounded shadow w-1/2">
          <FormItem className="text-[12pt]">
            <FormLabel className="text-[12pt]">Month</FormLabel>
            <FormControl>
              <Select
                {...register("month")}
                defaultValue={currentMonth}
                className="bg-blue-300 text-[12pt]"
              >
                <SelectItem value="1">January</SelectItem>
                <SelectItem value="2">February</SelectItem>
                <SelectItem value="3">March</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">May</SelectItem>
                <SelectItem value="6">June</SelectItem>
                <SelectItem value="7">July</SelectItem>
                <SelectItem value="8">August</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
              </Select>
            </FormControl>
          </FormItem>

          <FormItem className="text-[12pt]">
            <FormLabel className="text-[12pt]">Year</FormLabel>
            <FormControl className="bg-blue-300 text-[12pt]">
              <Input
                type="number"
                step="1"
                {...register("year")}
                defaultValue={currentYear}
                required
                className="bg-blue-300 text-[12pt]"
              />
            </FormControl>
          </FormItem>
        </Form>
      </div>
    </>
  );
};

const styles = {
  chartBox: {
    textAlign: "center",
    // maxWidth: "400px", // optional: control width
    font: {
      // weight: "bold",
      size: 12,
    },
  },
};

export default PieChart;
