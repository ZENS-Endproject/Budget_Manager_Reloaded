import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import About from "./pages/About";
import Login from "./pages/Login";
import Dark_light from "./components/Dark_light";
import ExpensesNav from "./components/ExpensesNav";
import IncomesNav from "./components/IncomesNav";
import FormExpenses from "./pages/FormExpenses";
import PrivateRoute from "./components/PrivateRoute";
import MyForm from "./pages/MyForm";
import EditIncome from "./pages/EditIncome";
import Expenses from "./components/Expenses";
import EditMonthExpense from "./pages/EditMonthExpense";
import EditMonthlyIncome from "./pages/EditMonthlyIncome";
import { ThemeProvider } from "next-themes";
import Signup from "./pages/Signup";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <React.StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
  <Routes>
    {/* Public */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    {/* App mit neuem Layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<App />} />
              <Route path="/expenses" element={<ExpensesNav />} />
              <Route path="/incomes" element={<IncomesNav />} />
              <Route path="/about" element={<About />} />
              <Route path="/edit-income/:userId/:expenseId" element={<EditIncome />} />
              <Route
                path="/edit-monthly-income/:user_id/:id"
                element={<EditMonthlyIncome />}
              />
              <Route path="/edit-expense/:userId/:expenseId" element={<MyForm />} />
              <Route
                path="/edit-monthlyexpense/:userId/:expenseId"
                element={<EditMonthExpense />}
              />
            </Route>
          </Routes>
        </Router>;
      </ThemeProvider>
    </React.StrictMode>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
