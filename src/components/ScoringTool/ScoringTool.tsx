import React, { useState } from "react";
import FielderButtons from "./FielderButtons";
import TypeButtons from "./TypeButtons";

type ScoringToolProps = {
  onAddOut: (type: string, count: number, display: string) => void;
  currentFieldingType: string;
  setFieldingType: (type: string) => void;
  closeTool: () => void;
};

const ScoringTool: React.FC<ScoringToolProps> = ({ onAddOut, currentFieldingType, setFieldingType, closeTool }) => {
  const [sequence, setSequence] = useState<number[]>([]);

  const toggleFielder = (num: number) => setSequence([...sequence, num]);
  const clearSequence = () => setSequence([]);

  const addOutToCell = () => {
    if (sequence.length === 0) return;
    let outs = 1;
    if (currentFieldingType === "DP") outs = 2;
    if (currentFieldingType === "TP") outs = 3;
    const display = `${sequence.join("-")} ${currentFieldingType}`;
    onAddOut(currentFieldingType, outs, display);
    clearSequence();
    setFieldingType("");
    closeTool();
  };

  return (
    <div style={{ margin: "8px 0", fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: 4 }}>Click fielders in order:</div>
      <FielderButtons onClick={toggleFielder} />
      <div style={{ marginBottom: 4 }}>
        <strong>Current Fielding:</strong> {sequence.length > 0 ? sequence.join("-") : ""} {currentFieldingType}
      </div>
      <TypeButtons currentType={currentFieldingType} onSelect={setFieldingType} />
      <div>
        <button onClick={addOutToCell} style={{ marginRight: 4, padding: "2px 6px", cursor: "pointer", background: "#4CAF50", color: "#fff", border: "none" }}>Add to Cell</button>
        <button onClick={clearSequence} style={{ padding: "2px 6px", cursor: "pointer", background: "#f44336", color: "#fff", border: "none" }}>Clear</button>
      </div>
    </div>
  );
};

export default ScoringTool;
