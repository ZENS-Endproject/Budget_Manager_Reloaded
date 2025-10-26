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

import { API_URL } from "../lib/utils";
import { Button } from "./ui/button";

function Monthly_incomes() {
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlySum, setMonthlySum] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    fetchMonthlyIncomes();
    fetchMonthlyIncomesSum();
  }, []);
  const fetchMonthlyIncomesSum = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/monthly_incomes/sum/${user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sum");
      }

      const data = await response.json();
      setMonthlySum(data.totalMonthlyIncomes || 0);
    } catch (err) {
      console.error("Error fetching sum:", err.message);
    }
  };

  const fetchMonthlyIncomes = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/monthly_incomes/${user_id}`, {
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
      const res = await fetch(`${API_URL}/monthly_incomes/${user_id}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
      <h1 className="text-2xl font-bold text-center my-6">Monthly Incomes</h1>

      {loading && <p className="text-center">Loading incomes...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="max-w-4xl mx-auto">
          <Table>
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
                          `/edit-monthly-income/${income.user_id}/${income.id}`,
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
              <TableRow
                style={{
                  backgroundColor: "#61DAFB",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                <TableCell className="font-medium">
                  Total Monthly Incomes for this month
                </TableCell>
                <TableCell>{parseFloat(monthlySum).toFixed(2)} €</TableCell>

                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

export default Monthly_incomes;
