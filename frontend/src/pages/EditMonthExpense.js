import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import Text from "../components/Text";

export default function EditMonthExpense() {
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

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (expense) {
      setExpenseId(expense.id || paramExpenseId);
      setUserId(expense.user_id || paramUserId);
      setName(expense.name || "");
      setAmount(expense.amount || "");
      setCategoryId(expense.category_id || "");
    }
  }, [expense, paramExpenseId, paramUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/monthly_expenses/${userId}/${expenseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category_id: categoryId,
            amount: amount,
            name: name,
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
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">
              <Text variant="subtitleBlue">Edit monthly expense</Text>
            </CardTitle>
            <CardDescription>
              <Text variant="smallBlack">Update the fields below</Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <Text variant="smallBlack">
                  <div className="grid gap-2">
                    <Label>Expense ID</Label>
                    <Input value={expenseId} disabled className="w-[250pt]" />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label>User ID</Label>
                    <Input value={userId} disabled className="w-[250pt]" />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label>Price (€)</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-[250pt]"
                    />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label>Name</Label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-[250pt]"
                    />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label>Category ID</Label>
                    <Input
                      type="number"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      className="w-[250pt]"
                    />
                  </div>
                </Text>
                {message && (
                  <div className="text-sm text-green-600">{message}</div>
                )}
                <Button type="submit" className="button w-[50pt]">
                  <Text variant="bodyBlack">Submit</Text>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
