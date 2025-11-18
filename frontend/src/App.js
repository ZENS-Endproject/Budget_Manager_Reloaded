import React from "react";
import Navbar from "./components/Navbar";
import PieChart from "./components/PieChart";
import InExBarChart from "./components/InExBarChart";
import theme from "./styles/theme.css";

import { Navigate } from "react-router-dom";
import "./App.css";
import MonthlyOverview from "./components/MonthlyOverview";

function App() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <div
        className="max-w-6xl pt-4 pb-12 grid grid-cols-1 md:grid-cols-2 gap-2
    "
      >
        <div
          className="bg-[var(--bg-white)] p-6 rounded-xl shadow"
          style={{
            padding: "40px",

            //marginBottom: "20px",
            border: "1px solid text-[var(--muted)]",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <PieChart />
        </div>
        <div
          className="bg-[var(--bg-white)] p-6 rounded-xl shadow"
          style={{
            padding: "40px",

            //marginBottom: "20px",
            border: "1px solid text-[var(--muted)]",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <MonthlyOverview />
        </div>
        <div
          className="md:col-span-2 bg-[var(--bg-white)] p-6 rounded-xl shadow"
          style={{
            padding: "40px",

            //marginBottom: "20px",
            border: "1px solid text-[var(--muted)]",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <InExBarChart />
        </div>
      </div>
    </>
  );
}

export default App;
