import React from "react";

export function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`w-full h-10 px-3 py-2 border rounded-md bg-background text-foreground border-input focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
