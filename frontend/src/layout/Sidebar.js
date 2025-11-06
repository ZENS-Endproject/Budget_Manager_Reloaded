import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Farbkonzept:
 *  - Hintergrund: #FEFEEF (helles Offwhite)
 *  - Text: #0A4A56
 *  - Hover: #0489A91A
 *  - Active: #E8EFEF
 */
export default function Sidebar() {
  const itemBase =
    "block rounded-2xl px-6 py-3 text-[20px] leading-tight transition-colors duration-200";
  const active =
    "bg-[#E8EFEF] text-[#0A4A56] font-semibold shadow-sm";
  const inactive =
    "text-[#0A4A56] hover:bg-[#0489A91A]";

  return (
    <aside
      className="app-sidebar w-120 shrink-0"
      style={{
        backgroundColor: "#FEFEEF",
      }}
    >
      <div className="sticky top-[100px] pl-16 pr-10 pt-10 pb-10 min-h-[calc(100vh-120px)] flex flex-col justify-between">
        {/* Navigation oben */}
        <nav className="flex flex-col gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${itemBase} ${isActive ? active : inactive}`
            }
          >
            Statistics
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `${itemBase} ${isActive ? active : inactive}`
            }
          >
            Expenses
          </NavLink>

          <NavLink
            to="/incomes"
            className={({ isActive }) =>
              `${itemBase} ${isActive ? active : inactive}`
            }
          >
            Income
          </NavLink>
        </nav>

        {/* Footer-Link leicht angehoben */}
        <div className="mt-auto pb-4">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `${itemBase} ${
                isActive
                  ? active
                  : "text-[#0A4A56]/90 hover:bg-[#0489A91A]"
              }`
            }
          >
            About us
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
