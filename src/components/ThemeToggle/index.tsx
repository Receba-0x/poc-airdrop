"use client";

import React, { useState, useEffect } from "react";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "switch";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  size = "md",
  variant = "button",
}) => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setMounted(true);

    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);

    // Apply theme to document
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
      console.log("Applied dark theme");
    } else {
      document.documentElement.classList.remove("dark");
      console.log("Applied light theme");
    }
    console.log("Document classes:", document.documentElement.className);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;

    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    // Apply to document
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      console.log("Toggled to dark theme");
    } else {
      document.documentElement.classList.remove("dark");
      console.log("Toggled to light theme");
    }
    console.log("Document classes after toggle:", document.documentElement.className);

    // Save to localStorage
    localStorage.setItem("theme", newTheme);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className={`
          flex items-center justify-center rounded-lg transition-all duration-200 ease-in-out
          bg-ds-bg-secondary hover:bg-ds-bg-tertiary border border-ds-border-secondary
          text-ds-text-primary hover:text-ds-text-accent
          focus:outline-none focus:ring-2 focus:ring-ds-border-accent focus:ring-offset-2
          ${
            size === "sm"
              ? "w-8 h-8 text-sm"
              : size === "md"
              ? "w-10 h-10 text-base"
              : "w-12 h-12 text-lg"
          }
          ${className}
        `}
        aria-label="Toggle theme"
        disabled
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>
    );
  }

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const switchSizeClasses = {
    sm: "w-12 h-6",
    md: "w-14 h-7",
    lg: "w-16 h-8",
  };

  if (variant === "switch") {
    return (
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ds-border-accent focus:ring-offset-2
          ${theme === "dark" ? "bg-primary-6" : "bg-neutral-6"}
          ${switchSizeClasses[size]}
          ${className}
        `}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        <span
          className={`
            inline-block transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out
            ${theme === "dark" ? "translate-x-7" : "translate-x-1"}
            ${size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6"}
          `}
        >
          <span className="sr-only">
            {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center justify-center rounded-lg transition-all duration-200 ease-in-out
        bg-ds-bg-secondary hover:bg-ds-bg-tertiary border border-ds-border-secondary
        text-ds-text-primary hover:text-ds-text-accent
        focus:outline-none focus:ring-2 focus:ring-ds-border-accent focus:ring-offset-2
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
};
