import React from "react";
import clsx from "clsx";

export default function Text({
  variant = "body",
  weight = "normal",
  children,
  className,
}) {
  const base = {
    menuBlue: "font-sourceserif text-2xl text-[var(--text-blue)]",
    subtitleBlue: "font-voces text-lg text-[var(--text-blue)]",
    bodyBlack: "font-voces text-sm text-[var(--text-black)]",
    bodyBlue: "font-voces text-sm text-[var(--text-blue)]",
    bodyRed: "font-voces text-sm text-[#DC2626]",
    smallBlack: "font-voces text-xs text-[var(--text-black)]",
    smallRed: "font-voces text-xs text-[#DC2626]",
  };
  // 12px	text-xs
  // 14px	text-sm
  // 16px	text-base
  // 18px	text-lg
  // 20px	text-xl
  // 24px	text-2xl

  return <p className={clsx(base[variant], className)}>{children}</p>;
}
