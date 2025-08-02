import React from "react";

export default function ProblemDescription({ theme }) {
  return (
    <div
      className={`h-full overflow-y-auto px-4 py-3 font-sans ${
        theme === "light" ? "text-gray-900" : "text-white"
      }`}
    >
      {/* Title */}
      <h2 className="text-xl font-bold tracking-wide mb-3">Problem Title</h2>

      {/* Difficulty & Tags */}
      <div className="flex items-center gap-3 mb-4">
        <span className="px-2 py-1 text-xs rounded-lg bg-blue-500/20 text-blue-300 font-medium">
          Medium
        </span>
        <span className="text-xs text-white/60">#Arrays</span>
        <span className="text-xs text-white/60">#HashMap</span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-white/90 mb-4">
        Given an array of integers, return all the elements that appear more than once.
        Your solution should aim for O(n) time complexity.
      </p>

      {/* Example */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Example:</h3>
        <pre className="bg-black/40 rounded-lg p-3 text-sm font-mono overflow-x-auto text-green-300">
{`Input: [1, 2, 3, 4, 2, 3]
Output: [2, 3]`}
        </pre>
      </div>

      {/* Constraints */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Constraints:</h3>
        <ul className="list-disc list-inside text-xs text-white/80 space-y-1">
          <li>1 ≤ nums.length ≤ 10⁵</li>
          <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
        </ul>
      </div>
    </div>
  );
}
