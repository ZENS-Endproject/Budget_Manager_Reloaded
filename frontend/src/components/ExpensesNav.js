import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Monthly_expenses from "./Monthly_expenses";
import Expenses from "./Expenses";
import AddExpenseForm from "./AddExpense";

import { API_URL } from "../lib/utils";
import { Button } from "./ui/button";
import Text from "./Text";

function ExpensesNav() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 mt-10 grid grid-cols-1 md:grid-cols-2 gap-2">
        <div
          className="md:col-span-2 bg-[var(--bg-white)] p-6 rounded-xl shadow"
          style={{
            padding: "40px",
            backgroundColor: "#ffffff",
            //marginBottom: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Monthly_expenses user_id={userId} />
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
          <Expenses user_id={userId} />
        </div>
      </div>
    </>
  );
}

export default ExpensesNav;
