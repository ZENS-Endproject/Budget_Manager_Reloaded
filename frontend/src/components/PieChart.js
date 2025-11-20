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
import Text from "./Text";

import { useTranslation } from "react-i18next";
import i18n from "../locales/i18n";

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
        color: "var(--text-black)",
        font: {
          family: "Voces, sans-serif",
          color: "var(--text-black)",
          size: 12,
        },
      },
    },
    datalabels: {
      color: "white", // Color of the data labels
      font: {
        // weight: "bold",
        family: "Voces, sans-serif",
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
  const { t } = useTranslation();
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
          const colors = [
            "#05CDFF",
            "#013947",
            "#037B99",
            "#04A6CF",
            "#02586E",
          ];
          setChartData({
            labels: data.labels,
            datasets: [
              {
                data: data.datasets[0].data,
                backgroundColor: data.labels.map(
                  (_, i) => colors[i % colors.length]
                ),
              },
            ],
          }); // Update pie chart data
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

  const formattedMonth = month.toString().padStart(2, "0");

  return (
    <>
      <Text variant="subtitleBlue">
        {t("expensesByCategory")} - {year}-{formattedMonth}
      </Text>
      <br />
      <div style={styles.chartBox}>
        <Form className="">
          <div className="flex justify-between gap-8">
            <FormLabel>
              <Text variant="bodyBlack">{t("year")}</Text>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="1"
                {...register("year")}
                defaultValue={currentYear}
                required
                className="hover:bg-[#02586E]/10 text-[10pt] h-[25px] w-[115px] shadow"
              />
            </FormControl>
          </div>
          <br />
          <div className="flex justify-between gap-8">
            <FormLabel>
              <Text variant="bodyBlack">{t("month")}</Text>
            </FormLabel>
            <FormControl>
              <div className="h-[25px] w-[115px]">
                <Select
                  {...register("month")}
                  defaultValue={currentMonth}
                  className="hover:bg-[var(--text-blue)]/10 text-[10pt] shadow"
                >
                  <SelectItem value="1">{t("january")}</SelectItem>
                  <SelectItem value="2">{t("february")}</SelectItem>
                  <SelectItem value="3">{t("march")}</SelectItem>
                  <SelectItem value="4">{t("april")}</SelectItem>
                  <SelectItem value="5">{t("may")}</SelectItem>
                  <SelectItem value="6">{t("june")}</SelectItem>
                  <SelectItem value="7">{t("july")}</SelectItem>
                  <SelectItem value="8">{t("august")}</SelectItem>
                  <SelectItem value="9">{t("september")}</SelectItem>
                  <SelectItem value="10">{t("october")}</SelectItem>
                  <SelectItem value="11">{t("november")}</SelectItem>
                  <SelectItem value="12">{t("december")}</SelectItem>
                </Select>
              </div>
            </FormControl>
          </div>
        </Form>
        <br />
        <br />
        <div className="max-h-[400px] max-w-[800px] ">
          {isChartEmpty ? (
            <p style={{ color: "red" }}>
              No expenses available for the selected month and year.
            </p>
          ) : (
            <Pie data={chartData} options={options} width={400} height={400} />
          )}
        </div>
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
