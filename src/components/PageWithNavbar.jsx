import React from "react";
import Navbar from "./Navbar";
export default function PageWithNavbar({ children }) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
    </>
  );
}