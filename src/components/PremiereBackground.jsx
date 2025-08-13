import React from "react";

export default function PremiereBackground({ darkOverlay = true }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="premiere-aurora premiere-aurora--a" />
      <div className="premiere-aurora premiere-aurora--b" />
      <div className="premiere-aurora premiere-aurora--c" />
      <div className="premiere-aurora premiere-aurora--d" />

      <div className="premiere-grid-overlay" />

      {darkOverlay && <div className="absolute inset-0 bg-black/50" />}
    </div>
  );
}


