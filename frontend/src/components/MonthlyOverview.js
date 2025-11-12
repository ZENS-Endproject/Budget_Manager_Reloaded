import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Monthly_expenses from "./Monthly_expenses";
import Expenses from "./Expenses";
import AddExpenseForm from "./AddExpense";

import { API_URL } from "../lib/utils";
import { Button } from "./ui/button";
import Text from "./Text";

function MonthlyOverview() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [totalExpenses, setTotalExpenses] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(null);
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7); // "YYYY-MM"
  // const [debitPerMonth, setDebitPerMonth] = useState(null);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${API_URL}/total_balance/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not load balance data.");
        return;
      }

      setTotalExpenses(data.totalExpenses);
      setTotalIncome(data.totalIncome);
      setBalance(data.balance);
      //setDebitPerMonth(data.debitPerMonth);
      setMessage(data.message);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load balance data.");
    }
  };
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`${API_URL}/download-expenses/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error download PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expenses.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error PDF:", err);
      alert("Error download.");
    }
  };

  useEffect(() => {
    if (userId) fetchBalance();
  }, [userId]);
  const debitPerMonth = balance < 0 ? Math.abs(balance) / 4 : 0;

  return (
    <>
      <Text variant="subtitleBlue">Monthly Overview - {currentMonth}</Text>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {totalExpenses !== null && totalIncome !== null && (
        <>
          <br />
          <div className="flex justify-between gap-8">
            <Text variant="bodyBlack">Total Expenses</Text>
            <Text variant="bodyBlack">{totalExpenses.toFixed(2)} €</Text>
          </div>
          <br />
          <div className="flex justify-between gap-8">
            <Text variant="bodyBlack">Total Income</Text>
            <Text variant="bodyBlack">{totalIncome.toFixed(2)} €</Text>
          </div>
          <br />
          <div className="flex justify-between gap-8">
            <Text variant="bodyBlack">Balance</Text>
            <Text
              variant={balance < 0 ? "bodyRed" : "bodyBlack"}
              className="font-bold"
            >
              {balance < 0 ? "" : "+"} {balance.toFixed(2)} €
            </Text>
          </div>
          {balance < 0 && debitPerMonth !== null && (
            <Text variant="smallRed" className="font-bold mt-2">
              Your expenses exceed your income. To cover the debit, divide the
              amount over 4 months: Save{" "}
              <strong>{Math.abs(debitPerMonth).toFixed(2)} €</strong> per month.
            </Text>
          )}
        </>
      )}
      <br />
      <Button onClick={handleDownloadPDF} className="button">
        <Text variant="bodyBlack">Download PDF</Text>
      </Button>{" "}
    </>
  );
}

export default MonthlyOverview;
