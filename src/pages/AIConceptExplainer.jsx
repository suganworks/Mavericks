import { useState } from "react";
import axios from "axios";

export default function AIConceptExplainer() {
  const [concept, setConcept] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    if (!concept.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5001/api/explain", { concept });
      setExplanation(res.data.explanation);
    } catch (err) {
      console.error(err);
      setExplanation("Error fetching explanation.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">AI Concept Explainer</h1>
      <input
        type="text"
        placeholder="Enter concept..."
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
        className="p-2 rounded text-black w-80"
      />
      <button
        onClick={handleExplain}
        className="ml-2 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
      >
        Explain
      </button>
      {loading && <p className="mt-4">Loading...</p>}
      {explanation && <p className="mt-4 bg-gray-800 p-4 rounded">{explanation}</p>}
    </div>
  );
}
