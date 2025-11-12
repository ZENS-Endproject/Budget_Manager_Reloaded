import React from "react";

export default function MainContent({ children, onClickMain }) {
  return (
    <main
      className="app-content flex-1 bg-[var(--bg)] transition-colors duration-300"
      onClick={onClickMain}
    >

      <div className="app-content__inner pl-10 pr-16 py-6 w-full">
        {children}
      </div>
    </main>
  );
}
