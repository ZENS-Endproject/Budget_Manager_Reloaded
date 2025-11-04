import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddIncomeForm from "./AddIncome";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { FormItem, FormLabel, FormControl } from "./ui/form";
import { Input } from "./ui/input";
import { API_URL } from "../lib/utils";
import Text from "./Text";
function MonthlyIncomes() {
  const [income, setIncome] = useState([]);
  const [monthlySum, setMonthlySum] = useState(0);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    setSelectedMonthYear(currentMonth);
    fetchMonthlyIncomes(currentMonth);
    fetchMonthlyIncomesSum();
  }, []);
  const fetchMonthlyIncomesSum = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/monthly_incomes/sum/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sum");
      }

      const data = await response.json();
      setMonthlySum(data.totalMonthlyIncomes || 0);
    } catch (err) {
      console.error("Error fetching sum:", err.message);
    }
  };

  const fetchMonthlyIncomes = async (monthYear = "") => {
    const token = localStorage.getItem("token");
    const url = monthYear
      ? `${API_URL}/monthly_incomes/${userId}/search?monthYear=${monthYear}`
      : `${API_URL}/monthly_incomes/${userId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch incomes");
      }
      const data = await response.json();
      setIncome(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Do you Want to delete this monthly income entry?"
    );
    if (!confirmed) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/monthly_incomes/${userId}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error while deleting");
      }

      setIncome((prev) => prev.filter((item) => item.id !== id));
      fetchMonthlyIncomesSum();
      window.location.reload();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <>
      <AddIncomeForm />
      <Text variant="subtitleBlue" className="text-center my-6">
        Regular Incomes {selectedMonthYear}
      </Text>

      <div className="text-center mt-10">
        <Button
          onClick={() => setShowMonthFilter(!showMonthFilter)}
          className="mb-4"
        >
          {showMonthFilter ? "Hide filter" : "Filter by Month"}
        </Button>

        {showMonthFilter && (
          <div className="max-w-sm mx-auto mt-4">
            <FormItem>
              <FormLabel>Select Month</FormLabel>
              <FormControl>
                <Input
                  type="month"
                  value={selectedMonthYear}
                  onChange={(e) => {
                    setSelectedMonthYear(e.target.value);
                    fetchMonthlyIncomes(e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
            <br />
            <Button
              onClick={() => {
                setSelectedMonthYear("");
                fetchMonthlyIncomes();
                setShowMonthFilter(false);
              }}
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      {loading && <p className="text-center">Loading incomes...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="max-w-4xl mx-auto">
          <Table className="incomes-table">
            <TableCaption></TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Price (€)</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {income.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium">{income.name}</TableCell>
                  <TableCell>{parseFloat(income.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    {income.date_start
                      ? new Date(income.date_start).toLocaleDateString()
                      : "No start date"}
                  </TableCell>
                  <TableCell>
                    {income.date_end
                      ? new Date(income.date_end).toLocaleDateString()
                      : "Ongoing"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() =>
                        navigate(
                          `/edit-monthly-income/${income.userId}/${income.id}`,
                          {
                            state: { income },
                          }
                        )
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(income.id)}
                      className="text-red-500 underline"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {selectedMonthYear === new Date().toISOString().slice(0, 7) && (
                <TableRow
                  style={{
                    backgroundColor: "#7FDBFF",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  <TableCell className="font-medium">
                    Total Monthly Incomes for this month {selectedMonthYear}
                  </TableCell>
                  <TableCell>{parseFloat(monthlySum).toFixed(2)} €</TableCell>

                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

export default MonthlyIncomes;
