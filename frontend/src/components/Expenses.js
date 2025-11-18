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
import Text from "./Text";
import App from "../App";
import AddExpenseForm from "./AddExpenseOnce";
import { useTranslation } from "react-i18next";
import i18next from "../locales/i18n";
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
  const { t } = useTranslation();

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
    const confirmed = window.confirm(t("deleteEntry"));
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
      header: t("name"),
    },
    {
      accessorKey: "amount",
      header: () => (
        <span className="text-right w-full block">{t("price")}</span>
      ),
      cell: ({ row }) => (
        <span className="text-right w-full block">
          {parseFloat(row.getValue("amount")).toFixed(2)} €
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: t("category"),
    },
    {
      accessorKey: "date",
      header: t("date"),
      cell: ({ row }) => {
        const rawDate = row.getValue("date");
        const date = new Date(rawDate);
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
      },
    },
    {
      id: "actions",
      header: t("actions"),
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
              className="button"
            >
              <Text variant="bodyBlack">{t("edit")}</Text>
            </Button>
            <Button onClick={() => handleDelete(expense.id)} className="button">
              <Text variant="bodyBlack">{t("delete")}</Text>
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
      <Text variant="subtitleBlue">
        {t("oneTimeExpenses")} {selectedMonthYear}
      </Text>

      <AddExpenseForm />

      <Button
        onClick={() => setShowMonthFilter(!showMonthFilter)}
        className="button mb-2"
      >
        <Text variant="bodyBlack">
          {showMonthFilter ? t("hideFilter") : t("filterByMonth")}
        </Text>
      </Button>

      {showMonthFilter && (
        <div className="max-w-sm mx-auto">
          <FormItem>
            <FormLabel>{t("selectMonth")}</FormLabel>
            <FormControl>
              <Input
                type="month"
                value={selectedMonthYear}
                onChange={(e) => {
                  setSelectedMonthYear(e.target.value);
                  fetchExpenses(e.target.value);
                }}
              />
            </FormControl>
          </FormItem>

          <Button
            onClick={() => {
              setSelectedMonthYear("");
              fetchExpenses("");
              setShowMonthFilter(false);
            }}
            className="button my-2"
          >
            <Text variant="bodyBlack">{t("resetFilter")}</Text>
          </Button>
        </div>
      )}

      {loading && <p className="text-center">{t("loadingExpenses")}</p>}
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
                        <Text variant="bodyBlue">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </Text>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <Text variant="bodyBlack">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Text>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {selectedMonthYear === new Date().toISOString().slice(0, 7) && (
                  <TableRow>
                    <TableCell>
                      <Text variant="bodyBlue">
                        <strong>
                          {t("totalOneTimeExpenses")} - {selectedMonthYear}
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
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-2">
            <Button
              className="button-prevnext"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <Text variant="smallBlack">{t("previous")}</Text>
            </Button>
            <Button
              className="button-prevnext"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <Text variant="smallBlack">{t("next")}</Text>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default Expenses;
