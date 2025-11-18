import React from "react";

export function Form({ children, ...props }) {
  return (
    <form className="font-voces text-xs text-black space-y-4" {...props}>
      {children}
    </form>
  );
}

export function FormItem({ children }) {
  return (
    <div className="font-voces text-xs text-black space-y-1">{children}</div>
  );
}

export function FormLabel({ children }) {
  return (
    <label className="font-voces text-xs text-black text-sm font-medium">
      {children}
    </label>
  );
}

export function FormControl({ children }) {
  return <div className="font-voces text-xs text-black">{children}</div>;
}

export function FormField({ children }) {
  return (
    <div className="font-voces text-xs text-black space-y-2">{children}</div>
  );
}
