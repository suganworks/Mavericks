import React, { useEffect, useRef } from "react";

export default function TerminalOutput({ glass, logs }) {
  const terminalRef = useRef(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const formatLog = (log) => {
    if (log.startsWith("❌")) {
      return <span className="text-red-400">{log}</span>;
    }
    if (log.includes("✅")) {
      return <span className="text-green-400">{log}</span>;
    }
    return <span className="text-white/90">{log}</span>;
  };

  return (
    <div
      className={`${glass} mt-4 p-3 text-sm font-mono h-40 overflow-y-auto`}
      ref={terminalRef}
    >
      {logs.split("\n").map((line, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {formatLog(line)}
        </div>
      ))}
    </div>
  );
}
