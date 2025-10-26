import React from "react";

export function Form({ children, ...props }) {
  return (
    <form className="space-y-4" {...props}>
      {children}
    </form>
  );
}

export function FormItem({ children }) {
  return <div className="space-y-1">{children}</div>;
}

export function FormLabel({ children }) {
  return <label className="text-sm font-medium">{children}</label>;
}

export function FormControl({ children }) {
  return <div>{children}</div>;
}

export function FormField({ children }) {
  return <div className="space-y-2">{children}</div>;
}
