import React from "react";

export default function MainContent({ children }) {
  return (
    <main className="app-content flex-1 bg-[#FEFEEF]">
      <div className="app-content__inner px-0 py-6 w-full">
        {children}
      </div>
    </main>
  );
}
