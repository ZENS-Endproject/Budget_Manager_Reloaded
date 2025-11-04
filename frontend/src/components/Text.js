import React from "react";
import clsx from "clsx";

export default function Text({
  variant = "body",
  weight = "normal",
  children,
  className,
}) {
  const base = {
    menuBlue: "font-sourceserif text-4xl text-[#02586E]",
    menuBlueBold: "font-sourceserif font-bold text-4xl text-[#02586E]",
    subtitleBlue: "font-voces text-2xl text-[#02586E]",
    bodyBlack: "font-voces text-lg text-black",
    bodyBlue: "font-voces text-lg text-[#02586E]",
    smallBlack: "font-voces text-xs text-black",
  };

  return <p className={clsx(base[variant], className)}>{children}</p>;
}
