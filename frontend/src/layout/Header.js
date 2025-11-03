import React from "react";

export default function Header() {
  return (
    <header className="w-full border-b bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-6 h-16">
        <h1 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
          Budget App
        </h1>

        <div className="flex items-center gap-3">
          {/* Platz für Icons, Profil oder Theme-Toggle */}
          <button className="text-sm text-gray-600 dark:text-gray-300">
            Settings
          </button>
        </div>
      </div>
    </header>
  );
}
