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
import Text from "../components/Text";

export default function EditIncome() {
  const { state } = useLocation();
  const income = state?.income;
  const navigate = useNavigate();
  const { userId: paramUserId, incomeId: paramIncomeId } = useParams();

  const [incomeId, setIncomeId] = useState("");
  const [userId, setUserId] = useState("");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (income) {
      setIncomeId(income.id || paramIncomeId);
      setUserId(income.user_id || paramUserId);
      setName(income.name || "");
      setAmount(income.amount || "");
      const formattedDate = income.date
        ? new Date(income.date).toISOString().slice(0, 10)
        : "";
      setDate(formattedDate);
    }
  }, [income, paramIncomeId, paramUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/income/${userId}/${incomeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: amount,
          name: name,
          date: date,
        }),
      });

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
            <CardTitle className="font-normal">
              <Text variant="subtitleBlue">Edit income</Text>
            </CardTitle>
            <CardDescription>
              <Text variant="smallBlack">Update the fields below</Text>
              <Text variant="smallRed"></Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <Text variant="smallBlack">
                  <div className="grid gap-2">
                    <Label>Income ID</Label>
                    <Input value={incomeId} disabled className="w-[250pt]" />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label>User ID</Label>
                    <Input value={userId} disabled className="w-[250pt]" />
                  </div>
                  <div className="grid gap-2  mt-2">
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
                  {/* <div className="grid gap-2"> */}
                  {/* <Label>Category ID</Label> */}
                  {/* <Input */}
                  {/* type="number" */}
                  {/* value={categoryId} */}
                  {/* onChange={(e) => setCategoryId(e.target.value)} */}
                  {/* required */}
                  {/* /> */}
                  {/* </div> */}
                  <div className="grid gap-2 mt-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
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
