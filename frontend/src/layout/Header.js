import React from "react";
import { useTheme } from "next-themes";

// Icons
import logo from "../assets/header/logo.png";
import lang from "../assets/header/lang.png";
import moon from "../assets/header/moon.png";
import power from "../assets/header/power.png";

export default function Header({ onToggleSidebar }) {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ height: 120, backgroundColor: "#FEFEEF" }}
    >
      {/* Hamburger nur Mobile */}
      <button
        type="button"
        className="hamburger md:hidden absolute left-6 top-[38px] z-50 p-2 rounded-lg bg-white/80 shadow hover:scale-105 transition"
        onClick={onToggleSidebar}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Hintergrund-Welle (belassen) */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <svg
          viewBox="0 0 1920 219"
          className="w-full h-full"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="clipPathHeader">
              <rect width="1920" height="219" fill="#fff" />
            </clipPath>
          </defs>
          <g clipPath="url(#clipPathHeader)">
            <g transform="translate(1922.402 376.183) rotate(180)">
              <g transform="translate(-0.001 156.821)">
                <path d="M1066.64,0" transform="translate(855.763 370.031)" fill="#fff" />
                <path
                  d="M0-497.29s-1.562,11.965,158.719,17.379,269.016-14.533,482.4,4.276c213.625,18.808,426.533,60.906,640.158,52.5,213.389-8.4,301.65-32.082,453.229-56.778S1922.4-508.266,1922.4-508.266V-258.9H110.882C102.621-258.9,0-258.821,0-259V-497.29"
                  transform="translate(0.001 508.266)"
                  fill="rgba(249,190,40,0.63)"
                />
                <path
                  d="M0-396.634s52.929,26.184,141.35,52.368,286.384,64.534,499.771,80.546c213.625,16.012,431.341-60.983,644.966-64.836,213.389-3.853,422.448,65.679,529.382,80.848l106.934,15.29v122.8H0V-396.634"
                  transform="translate(0.001 434.529)"
                  fill="#dca61c"
                />
                <path
                  d="M0-233.19l106.934,7.11C213.867-219.122,426.911-186.447,640.3-204.9c213.625-18.456,452.691-70.159,666.315-81.051,213.389-10.892,401.922.876,508.856,15.4L1922.4-255.881V-62.25H0V-233.19"
                  transform="translate(0.001 386.05)"
                  fill="#f9be28"
                />
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Inhalte */}
      <div className="relative z-10 pl-16 h-full">
        <div className="mx-auto flex h-full items-center justify-start gap-2 px-3">
          <img src={logo} alt="Logo" className="w-14 h-14 hover:scale-105 transition logo-light" />
          <img src={lang} alt="Language" className="w-14 h-14 hover:scale-105 transition" />
          <img
            src={moon}
            alt="Toggle dark mode"
            className="w-14 h-14 hover:scale-105 transition cursor-pointer"
            onClick={toggleTheme}
          />
          <img src={power} alt="Power" className="w-14 h-14 hover:scale-105 transition" />
        </div>
      </div>
    </header>
  );
}
