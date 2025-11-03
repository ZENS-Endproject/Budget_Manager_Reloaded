import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const link = "block px-4 py-2 rounded-md transition";
  const active = "bg-[#0489A9] text-white font-semibold";
  const inactive = "hover:bg-[#0489A933] text-gray-800 dark:text-gray-200";

  return (
    <aside className="w-64 shrink-0 border-r">
      <div className="p-4">
        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={({isActive}) => `${link} ${isActive?active:inactive}`}>Statistics</NavLink>
          <NavLink to="/expenses" className={({isActive}) => `${link} ${isActive?active:inactive}`}>Expenses</NavLink>
          <NavLink to="/incomes" className={({isActive}) => `${link} ${isActive?active:inactive}`}>Income</NavLink>
          <NavLink to="/about" className={({isActive}) => `${link} ${isActive?active:inactive}`}>About us</NavLink>
        </nav>
      </div>
    </aside>
  );
}
