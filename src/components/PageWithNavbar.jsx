import React from "react";
import Navbar from "./Navbar";
export default function PageWithNavbar({ children }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">{children}</div>
    </>
  );
}