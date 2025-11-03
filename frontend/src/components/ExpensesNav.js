import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Monthly_expenses from "./Monthly_expenses";
import Expenses from "./Expenses";
import AddExpenseForm from "./AddExpense";

import { API_URL } from "../lib/utils";
import { Button } from "./ui/button";

function ExpensesNav() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [totalExpenses, setTotalExpenses] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(null);
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

      <div
        className="expenses-nav"
        style={{
          padding: "20px",
          backgroundColor: "#ffffff",
          marginBottom: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Button onClick={handleDownloadPDF}>Download (PDF)</Button> <br />{" "}
        <br />
        <h2 style={{ color: "#1e88e5", marginBottom: "16px" }}>
          Monthly Overview
        </h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {totalExpenses !== null && totalIncome !== null && (
          <>
            <p>
              <strong>Total Expenses:</strong>{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>
                {totalExpenses.toFixed(2)} €
              </span>
            </p>
            <p>
              <strong>Total Income:</strong>{" "}
              <span style={{ color: "green", fontWeight: "bold" }}>
                {" "}
                {totalIncome.toFixed(2)} €
              </span>
            </p>
            <p>
              <strong>Balance:</strong>{" "}
              <span
                style={{
                  color: balance < 0 ? "red" : "green",
                  fontWeight: "bold",
                }}
              >
                {balance.toFixed(2)} €
              </span>
            </p>
            {balance < 0 && debitPerMonth !== null && (
              <p style={{ color: "red", fontWeight: "bold" }}>
                Your expenses exceed your income.{" "}
                <span>
                  To cover the debit, divide the amount over 4 months: Save{" "}
                </span>
                <strong style={{ color: "green" }}>
                  {" "}
                  {Math.abs(debitPerMonth).toFixed(2)} €
                </strong>{" "}
                per month.
              </p>
            )}
          </>
        )}
      </div>
      <AddExpenseForm />
      <Monthly_expenses user_id={userId} />
      <Expenses user_id={userId} />
    </>
  );
}

export default ExpensesNav;
