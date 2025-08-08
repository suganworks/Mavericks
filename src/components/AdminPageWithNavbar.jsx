import React from "react";
import AdminNavbar from "./AdminNavbar";

export default function AdminPageWithNavbar({ children }) {
  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen">{children}</div>
    </>
  );
}