import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import App from "../App";
import AddIncomeForm from "./AddIncomeOnce";

function Income() {
  const [income, setIncome] = useState([]);
  const [sum, setSum] = useState(0);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const navigate = useNavigate();
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // "YYYY-MM"
    setSelectedMonthYear(currentMonth);
    fetchIncomes(currentMonth);
    fetchIncomesSum();
  }, []);
  const fetchIncomes = async (monthYear = "") => {
    const token = localStorage.getItem("token");
    const url = monthYear
      ? `${API_URL}/incomes/${userId}/search?monthYear=${monthYear}`
      : `${API_URL}/incomes/${userId}`;
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch incomes");
      }
      const data = await res.json();
      setIncome(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Do you really want to delete this entry?"
    );
    if (!confirmed) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/income/${userId}/${id}`, {
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
      setIncome((prev) => prev.filter((i) => i.id !== id));
      fetchIncomesSum();
      window.location.reload();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const fetchIncomesSum = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/incomes/sum/${userId}`, {
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
      setSum(data.totalIncomes || 0);
    } catch (err) {
      console.error("Error fetching sum:", err.message);
    }
  };

  return (
    <>
      <Text variant="subtitleBlue">One-time income {selectedMonthYear}</Text>
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
                  fetchIncomes(e.target.value);
                }}
              />
            </FormControl>
          </FormItem>

          <Button
            onClick={() => {
              setSelectedMonthYear("");
              fetchIncomes();
              setShowMonthFilter(false);
            }}
            className="button my-2"
          >
            <Text variant="bodyBlack">Reset filter</Text>
          </Button>
        </div>
      )}

      {loading && <p className="text-center">Loading income...</p>}
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
                    <Text variant="bodyBlue">Date</Text>
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
                        {income.date
                          ? (() => {
                              const d = new Date(income.date);
                              return `${d.getDate()}.${
                                d.getMonth() + 1
                              }.${d.getFullYear()}`;
                            })()
                          : "No date"}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() =>
                          navigate(
                            `/edit-income/${income.user_id}/${income.id}`,
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
                          Total one-time income for {selectedMonthYear}{" "}
                        </strong>
                      </Text>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-right w-full block">
                        <Text variant="bodyBlue">
                          <strong>{parseFloat(sum).toFixed(2)} €</strong>
                        </Text>
                      </span>
                    </TableCell>
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
export default Income;
