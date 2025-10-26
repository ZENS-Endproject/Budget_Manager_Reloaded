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

export default function EditMonthlyIncome() {
  const { state } = useLocation();
  const income = state?.income;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { userId: paramUserId, incomeId: paramIncomeId } = useParams();

  const [incomeId, setIncomeId] = useState("");
  const [userId, setUserId] = useState("");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (income) {
      setIncomeId(income.id || paramIncomeId);
      setUserId(income.user_id || paramUserId);
      setName(income.name || "");
      setAmount(income.amount || "");
    }
  }, [income, paramIncomeId, paramUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/monthly_incomes/${userId}/${incomeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: amount,
            name: name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error updating income");
      }

      const updatedIncome = await response.json();
      console.log("Update successful:", updatedIncome);
      setMessage("Income updated successfully!");
      setTimeout(() => navigate("/incomes"), 1000);
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the income.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Monthly Income</CardTitle>
            <CardDescription>Update the fields below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label>Income ID</Label>
                  <Input value={incomeId} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>User ID</Label>
                  <Input value={userId} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Price (€)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2" v>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {message && (
                  <div className="text-sm text-green-600">{message}</div>
                )}

                <Button type="submit" className="w-full">
                  Speichern
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
