import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  flexRender,
  getPaginationRowModel,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { API_URL } from "../lib/utils";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sum, setSum] = useState(0);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const navigate = useNavigate();
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  const fetchExpenses = async (monthYear = "") => {
    const token = localStorage.getItem("token");
    try {
      const url = monthYear
        ? `${API_URL}/expenses/${userId}/search?monthYear=${monthYear}`
        : `${API_URL}/expenses/${userId}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
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
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/expenses/sum/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch sum");
      const data = await res.json();
      setSum(data.totalExpenses || 0);
    } catch (err) {
      console.error("Error fetching sum:", err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Do you really want to delete this entry?"
    );
    if (!confirmed) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/expenses/${userId}/${id}`, {
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
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "amount",
      header: "Price (€)",
      cell: ({ row }) => `${parseFloat(row.getValue("amount")).toFixed(2)} €`,
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.getValue("date")).toISOString().split("T")[0],
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div>
            <Button
              onClick={() =>
                navigate(`/edit-expense/${expense.user_id}/${expense.id}`, {
                  state: { expense },
                })
              }
            >
              Edit
            </Button>
            <Button
              onClick={() => handleDelete(expense.id)}
              className="text-red-500 underline"
            >
              Delete
            </Button>
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
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  return (
    <>
      <h1 className="text-2xl font-bold text-center my-6">
        One-time expenses {selectedMonthYear}
      </h1>
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          onClick={() => setShowMonthFilter(!showMonthFilter)}
          className="text-right font-medium"
        >
          {"Filter by Month"}
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
                    fetchExpenses(e.target.value);
                  }}
                  className="w-[200px]"
                />
              </FormControl>
            </FormItem>
            <br />
            <Button
              className="text-right font-medium"
              onClick={() => {
                setSelectedMonthYear("");
                fetchExpenses("");
                setShowMonthFilter(false);
              }}
            >
              Reset filter
            </Button>
          </div>
        )}
      </div>

      {loading && <p className="text-center">Loading expenses...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="max-w-5xl mx-auto">
          <div className="table-wrapper">
            <Table className="expenses-table">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="font-medium">

                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {selectedMonthYear === new Date().toISOString().slice(0, 7) && (
                  <TableRow
                    style={{
                      backgroundColor: "#0489A9",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    <TableCell className="font-medium">
                      Total one-time expenses for this month {selectedMonthYear}
                    </TableCell>
                    <TableCell>{parseFloat(sum).toFixed(2)}€</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default Expenses;
