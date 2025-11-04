import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { FormItem, FormLabel, FormControl } from "./ui/form";
import { Input } from "./ui/input";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { API_URL } from "../lib/utils";
import Text from "./Text";

function MonthlyExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [monthlySum, setMonthlySum] = useState(0);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const navigate = useNavigate();

  const fetchMonthlyExpenses = async (monthYear = "") => {
    const token = localStorage.getItem("token");
    const url = monthYear
      ? `${API_URL}/monthly_expenses/${userId}/search?monthYear=${monthYear}`
      : `${API_URL}/monthly_expenses/${userId}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch expenses.");
      }

      const data = await response.json();
      setExpenses(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchMonthlyExpensesSum = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_URL}/monthly_expenses/sum/${userId}`,
        {
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
      setMonthlySum(data.totalMonthlyExpenses || 0);
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
      const res = await fetch(`${API_URL}/monthly_expenses/${userId}/${id}`, {
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
      fetchMonthlyExpensesSum();
      window.location.reload();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    setSelectedMonthYear(currentMonth);
    fetchMonthlyExpenses(currentMonth);
    fetchMonthlyExpensesSum();
  }, []);

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      size: 100,
      cell: ({ row }) => row.getValue("name"),
    },
    {
      accessorKey: "amount",
      header: "Price (€)",
      cell: ({ row }) => parseFloat(row.getValue("amount")).toFixed(2) + " €",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "date_start",
      header: "Start Date",
      cell: ({ row }) =>
        row.getValue("date_start")
          ? new Date(row.getValue("date_start")).toLocaleDateString()
          : "No start date",
    },
    {
      accessorKey: "date_end",
      header: "End Date",
      cell: ({ row }) =>
        row.getValue("date_end")
          ? new Date(row.getValue("date_end")).toLocaleDateString()
          : "Ongoing",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div>
            <Button
              onClick={() =>
                navigate(
                  `/edit-monthlyexpense/${expense.user_id}/${expense.id}`,
                  {
                    state: { expense },
                  }
                )
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
    state: {
      sorting,
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <Text variant="subtitleBlue" className="text-center my-6">
        Regular expenses {selectedMonthYear}
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
                    fetchMonthlyExpenses(e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
            <br />
            <Button
              onClick={() => {
                setSelectedMonthYear("");
                fetchMonthlyExpenses();
                setShowMonthFilter(false);
              }}
            >
              Reset Filter
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
                      <TableHead
                        key={header.id}
                        className={`${
                          header.column.id === "name" ? "w-[100px]" : ""
                        } ${
                          header.column.id === "actions" ? "text-right" : ""
                        }`}
                      >
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
                      <TableCell
                        key={cell.id}
                        className={`font-medium ${
                          cell.column.id === "name" ? "w-[100px]" : ""
                        } ${cell.column.id === "actions" ? "text-right" : ""}`}
                      >
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
                      Total regular expenses for this month {selectedMonthYear}
                    </TableCell>
                    <TableCell>{parseFloat(monthlySum).toFixed(2)} €</TableCell>
                    <TableCell />
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

export default MonthlyExpenses;
