import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

/**
 * Farbkonzept:
 *  - Hintergrund: #FEFEEF (helles Offwhite)
 *  - Text: #0A4A56
 *  - Hover: #0489A91A
 *  - Active: #E8EFEF
 */
export default function Sidebar({ open = false, onClose = () => {} }) {
  const itemBase =
    "block rounded-2xl px-6 py-3 text-[20px] leading-tight transition-colors duration-200";
  const active = "bg-[#E8EFEF] text-[#0A4A56] font-semibold shadow-sm";
  const inactive = "text-[#0A4A56] hover:bg-[#0489A91A]";

  // Body-Scroll sperren, wenn Drawer offen (mobile)
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  return (
    <>
      {/* Overlay (nur Mobile sichtbar, wenn offen) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar: Desktop = statisch; Mobile = Drawer */}
      <aside
        className={[
          "app-sidebar",
          "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 md:static md:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
          "bg-[#FEFEEF] md:w-120 md:translate-x-0 md:transform-none",
          "md:shrink-0",
        ].join(" ")}
      >
        <div
          className="pl-6 pr-6 pt-[120px] md:pt-10 pb-10 
                    min-h-full md:pl-16 md:pr-10 
                    md:min-h-[calc(100vh-120px)] 
                    md:sticky md:top-[100px] 
                    flex flex-col justify-between 
                    overflow-y-auto"
        >
          {/* Navigation oben */}
          <nav className="flex flex-col gap-4" onClick={onClose}>
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

          {/* Footer-Link */}
          <div className="mt-auto pb-2 md:pb-4" onClick={onClose}>
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
    </>
  );
}
