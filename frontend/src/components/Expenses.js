import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { FormItem, FormLabel, FormControl } from "./ui/form";
import { flexRender, getPaginationRowModel, getCoreRowModel, useReactTable, getFilteredRowModel, getSortedRowModel } from "@tanstack/react-table";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { API_URL } from "../lib/utils";
import Text from "./Text";
import ProtectedRoute from "./ProtectedRoute";

function ExpensesContent() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sum, setSum] = useState(0);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const navigate = useNavigate();
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  // 🔹 Fetch expenses depuis backend avec session
  const fetchExpenses = async (monthYear = "") => {
    try {
      const url = monthYear
        ? `${API_URL}/expenses/search?monthYear=${monthYear}`
        : `${API_URL}/expenses`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      setExpenses(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchExpensesSum = async () => {
    try {
      const res = await fetch(`${API_URL}/expenses/sum`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sum");
      const data = await res.json();
      setSum(data.totalExpenses || 0);
    } catch (err) {
      console.error("Error fetching sum:", err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Do you really want to delete this entry?");
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error while deleting");
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // "YYYY-MM"
    setSelectedMonthYear(currentMonth);
    fetchExpenses(currentMonth);
    fetchExpensesSum();
  }, []);

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "amount", header: "Price (€)", cell: ({ row }) => `${parseFloat(row.getValue("amount")).toFixed(2)} €` },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "date", header: "Date", cell: ({ row }) => new Date(row.getValue("date")).toISOString().split("T")[0] },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div>
            <Button onClick={() => navigate(`/edit-expense/${expense.id}`, { state: { expense } })}>Edit</Button>
            <Button onClick={() => handleDelete(expense.id)} className="text-red-500 underline">Delete</Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: expenses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  return (
    <>
      <Text variant="subtitleBlue" className="text-center my-6">One-time expenses {selectedMonthYear}</Text>
      {/* ... Le reste du rendu reste identique ... */}
    </>
  );
}

// 🔹 Encapsulation avec ProtectedRoute
export default function Expenses() {
  return (
    <ProtectedRoute>
      <ExpensesContent />
    </ProtectedRoute>
  );
}
