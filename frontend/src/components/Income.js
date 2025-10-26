import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
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

function Income() {
  const [income, setIncome] = useState([]);
  const [Sum, setSum] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    fetchIncomes();
    fetchIncomesSum();
  }, []);
  const fetchIncomes = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/incomes/${user_id}`, {
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
      const res = await fetch(`${API_URL}/income/${user_id}/${id}`, {
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

      window.location.reload();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const fetchIncomesSum = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/incomes/sum/${user_id}`, {
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
      <h1 className="text-2xl font-bold text-center my-6">One-Time Incomes</h1>
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
                  <TableCell>
                    {parseFloat(parseFloat(income.amount).toFixed(2)).toFixed(
                      2
                    )}
                  </TableCell>
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
              <TableRow
                style={{
                  backgroundColor: "#61DAFB",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                <TableCell>Total One-Time Incomes for this month</TableCell>
                <TableCell>{parseFloat(Sum).toFixed(2)}€</TableCell>
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
export default Income;
