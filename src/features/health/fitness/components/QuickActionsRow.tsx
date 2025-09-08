import React from "react";
import { Link } from "react-router-dom";

export default function QuickActionsRow() {
  const actions = [
    { href: "/training/templates", label: "Templates", color: "#2e7bff" },
    { href: "/training/history", label: "History", color: "#ff8a1f" },
    { href: "/training/programs", label: "Programs", color: "#7b61ff" },
    { href: "/mentors", label: "Mentors", color: "#00c37a" }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          to={action.href}
          className="flex items-center justify-center h-22 rounded-xl text-white font-bold text-center transition-transform hover:scale-105"
          style={{ backgroundColor: action.color }}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}