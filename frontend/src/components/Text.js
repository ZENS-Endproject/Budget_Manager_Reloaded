import React from "react";
import clsx from "clsx";

export default function Text({
  variant = "body",
  weight = "normal",
  children,
  className,
}) {
  const base = {
    menuBlue: "font-sourceserif text-2xl text-[#02586E]",
    subtitleBlue: "font-voces text-lg text-[#02586E]",
    bodyBlack: "font-voces text-base text-black",
    bodyBlue: "font-voces text-base text-[#02586E]",
    bodyRed: "font-voces text-base text-[#DC2626]",
    smallBlack: "font-voces text-xs text-black",
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
