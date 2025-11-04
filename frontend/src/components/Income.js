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

function Income() {
  const [income, setIncome] = useState([]);
  const [Sum, setSum] = useState(0);
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
      <Text variant="subtitleBlue" className="text-center my-6">
        One-Time Incomes {selectedMonthYear}
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
              <FormLabel>Select Filter</FormLabel>
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
            <br />
            <Button
              onClick={() => {
                setSelectedMonthYear("");
                fetchIncomes();
                setShowMonthFilter(false);
              }}
            >
              Reset filter
            </Button>
          </div>
        )}
      </div>
      {loading && <p className="text-center">Loading income...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="max-w-4xl mx-auto">
          <Table className="incomes-table">
            <TableCaption></TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Price (€)</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {income.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium">{income.name}</TableCell>
                  <TableCell>{parseFloat(income.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(income.date).toISOString().split("T")[0]}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() =>
                        navigate(
                          `/edit-income/${income.user_id}/${income.id}`,
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
                  <TableCell>
                    Total One-Time Incomes for this month {selectedMonthYear}
                  </TableCell>
                  <TableCell>{parseFloat(Sum).toFixed(2)}€</TableCell>
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
export default Income;
