// src/pages/FormExpenses.jsx
import React from "react";
import UserTable from "../components/UserTable";
import ProtectedRoute from "../components/ProtectedRoute";

function FormExpenses() {
  return (
    <ProtectedRoute>
      <div>
        <UserTable />
      </div>
    </ProtectedRoute>
  );
}

export default FormExpenses;
