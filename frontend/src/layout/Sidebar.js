import React from "react";
import { NavLink } from "react-router-dom";
import Text from "../components/Text";

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
  const active = "bg-[#E8EFEF] text-[#0A4A56] font-semibold shadow-sm";
  const inactive = "text-[#0A4A56] hover:bg-[#0489A91A]";

  return (
    <aside
      className="app-sidebar w-120 shrink-0"
      style={{
        backgroundColor: "#FEFEEF",
      }}
    >
      {/* Sidebar-Inhalt: flex column + justify-between */}
      <div className="sticky top-[120px] pl-16 pr-10 pt-10 pb-12 mr-12 min-h-[calc(100vh-72px)] flex flex-col justify-between">
        {/* Navigation oben */}
        <nav className="flex flex-col gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${itemBase} ${isActive ? active : inactive}`
            }
          >
            <Text variant="menuBlue">Statistics</Text>
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `${itemBase} ${isActive ? active : inactive}`
            }
          >
            <Text variant="menuBlue">Expenses</Text>
          </NavLink>

          <NavLink
            to="/incomes"
            className={({ isActive }) =>
              `${itemBase} ${isActive ? active : inactive}`
            }
          >
            <Text variant="menuBlue">Income</Text>
          </NavLink>
        </nav>

        {/* Footer-Link automatisch unten */}
        <div className="mt-auto pt-8">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `${itemBase} ${
                isActive ? active : "text-[#0A4A56]/90 hover:bg-[#0489A91A]"
              }`
            }
          >
            <Text variant="menuBlue">About us</Text>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
