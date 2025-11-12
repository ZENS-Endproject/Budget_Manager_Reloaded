import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddIncomeForm from "./AddIncomeMonthly";
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
      <Text variant="subtitleBlue">Regular income {selectedMonthYear}</Text>
      <AddIncomeForm />
      <Button
        onClick={() => setShowMonthFilter(!showMonthFilter)}
        className="button mb-2"
      >
        <Text variant="bodyBlack">
          {showMonthFilter ? "Hide filter" : "Filter by Month"}
        </Text>
      </Button>

      {showMonthFilter && (
        <div className="max-w-sm mx-auto">
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

          <Button
            onClick={() => {
              setSelectedMonthYear("");
              fetchMonthlyIncomes();
              setShowMonthFilter(false);
            }}
            className="button my-2"
          >
            <Text variant="bodyBlack">Reset Filter</Text>
          </Button>
        </div>
      )}

      {loading && <p className="text-center">Loading incomes...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="max-w-5xl mx-auto">
          <div className="table-wrapper">
            <Table className="incomes-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Text variant="bodyBlue">Name</Text>
                  </TableHead>
                  <TableHead>
                    <Text
                      variant="bodyBlue"
                      className="text-right w-full block"
                    >
                      Price
                    </Text>
                  </TableHead>
                  <TableHead>
                    <Text variant="bodyBlue">Start Date</Text>
                  </TableHead>
                  <TableHead>
                    <Text variant="bodyBlue">End Date</Text>
                  </TableHead>
                  <TableHead>
                    <Text variant="bodyBlue">Actions</Text>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {income.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>
                      <Text variant="bodyBlack">{income.name}</Text>
                    </TableCell>
                    <TableCell>
                      <span className="text-right w-full block">
                        <Text variant="bodyBlack">
                          {parseFloat(income.amount).toFixed(2)} €
                        </Text>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Text variant="bodyBlack">
                        {income.date_start
                          ? new Date(income.date_start).toLocaleDateString()
                          : "No start date"}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text variant="bodyBlack">
                        {income.date_end
                          ? new Date(income.date_end).toLocaleDateString()
                          : "Ongoing"}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() =>
                          navigate(
                            `/edit-monthly-income/${income.userId}/${income.id}`,
                            {
                              state: { income },
                            }
                          )
                        }
                        className="button"
                      >
                        <Text variant="bodyBlack">Edit</Text>
                      </Button>
                      <Button
                        onClick={() => handleDelete(income.id)}
                        className="button"
                      >
                        <Text variant="bodyBlack">Delete</Text>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {selectedMonthYear === new Date().toISOString().slice(0, 7) && (
                  <TableRow>
                    <TableCell>
                      <Text variant="bodyBlue">
                        <strong>
                          Total regular income for {selectedMonthYear}
                        </strong>
                      </Text>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-right w-full block">
                        <Text variant="bodyBlue">
                          <strong>{parseFloat(monthlySum).toFixed(2)} €</strong>
                        </Text>
                      </span>
                    </TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}

export default MonthlyIncomes;
