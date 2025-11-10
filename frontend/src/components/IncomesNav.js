import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Income from "./Income";
import Monthly_incomes from "./Monthly_incomes";
import { useParams } from "react-router-dom";

import { API_URL } from "../lib/utils";
import Text from "./Text";

function IncomesNav() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const [totalExpenses, setTotalExpenses] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      setMessage(data.message);
      setError(""); // reset error if success
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load balance data.");
    }
  };

  useEffect(() => {
    if (userId) fetchBalance();
  }, [userId]);
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 mt-10 grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* <div
        className="expenses-nav"
        style={{
          padding: "20px",
          backgroundColor: "#f4f4f4",
          marginBottom: "20px",
        }}
      >
        <Text variant="subtitleBlue" className="my-6">
          Monthly Overview
        </Text>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {totalExpenses !== null && totalIncome !== null && (
          <>
            <p>Total Expenses: {totalExpenses.toFixed(2)} €</p>
            <p>Total Income: {totalIncome.toFixed(2)} €</p>
          </>
        )}
        {message &
        & <p style={{ color: "red" }}>{message}</p>}
      </div> */}
        <div
          className="md:col-span-2 bg-white p-6 rounded-xl shadow"
          style={{
            padding: "40px",
            backgroundColor: "#ffffff",
            //marginBottom: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Monthly_incomes user_id={userId} />
        </div>
        <div
          className="md:col-span-2 bg-white p-6 rounded-xl shadow"
          style={{
            padding: "40px",
            backgroundColor: "#ffffff",
            //marginBottom: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Income user_id={userId} />{" "}
        </div>
      </div>
    </>
  );
}

export default IncomesNav;
