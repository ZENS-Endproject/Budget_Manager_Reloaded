import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { cn } from "../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";

import { API_URL } from "../lib/utils";

export default function MyForm() {
  const { state } = useLocation();
  const expense = state?.expense;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { userId: paramUserId, expenseId: paramExpenseId } = useParams();

  const [expenseId, setExpenseId] = useState("");
  const [userId, setUserId] = useState("");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (expense) {
      setExpenseId(expense.id || paramExpenseId);
      setUserId(expense.user_id || paramUserId);
      setName(expense.name || "");
      setAmount(expense.amount || "");
      setCategoryId(expense.category_id || "");
      const formattedDate = expense.date
        ? new Date(expense.date).toISOString().slice(0, 10)
        : "";
      setDate(formattedDate);
    }
  }, [expense, paramExpenseId, paramUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/expenses/${userId}/${expenseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            category_id: categoryId,
            amount: amount,
            name: name,
            date: date,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error updating expense");
      }

      const updatedExpense = await response.json();
      console.log("Update successful:", updatedExpense);
      setMessage("Expense updated successfully!");
      setTimeout(() => navigate("/expenses"), 1000);
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the expense.");
    }
  };

  return (
    <>
      <Navbar />
      <div className={cn("flex flex-col gap-6")}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Expense</CardTitle>
            <CardDescription>Update the fields below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label>Expense ID</Label>
                  <Input value={expenseId} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>User ID</Label>
                  <Input value={userId} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Category ID</Label>
                  <Input
                    type="number"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                {message && (
                  <div className="text-sm text-green-600">{message}</div>
                )}
                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
