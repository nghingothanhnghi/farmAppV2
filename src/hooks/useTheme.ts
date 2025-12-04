// src/hooks/useTheme.ts
// import { useEffect, useState } from "react";

// export type Theme = "light" | "dark" | "system";

// export function useTheme() {
//   const [theme, setTheme] = useState<Theme>(() => {
//     return (localStorage.getItem("theme") as Theme) || "system";
//   });

//   useEffect(() => {
//     const root = document.documentElement;
//     const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

//     if (theme === "dark") {
//       root.classList.add("dark");
//     } else if (theme === "light") {
//       root.classList.remove("dark");
//     } else {
//       root.classList.toggle("dark", prefersDark);
//     }

//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   // 🔄 Listen to system changes when "system" is selected
//   useEffect(() => {
//     if (theme !== "system") return;
//     const mql = window.matchMedia("(prefers-color-scheme: dark)");
//     const handler = (e: MediaQueryListEvent) => {
//       document.documentElement.classList.toggle("dark", e.matches);
//     };
//     mql.addEventListener("change", handler);
//     return () => mql.removeEventListener("change", handler);
//   }, [theme]);

//   const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

//   return { theme, setTheme, isDark };
// }


import { useEffect } from "react";
import { useThemeContext } from "../contexts/themeContext";

export function useTheme() {
  const { theme, setTheme } = useThemeContext();

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const isDark =
    theme === "dark" ||
    (theme === "system" && prefersDark);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
    else root.classList.toggle("dark", prefersDark);
  }, [theme]);

  return { theme, setTheme, isDark };
}

