import React, { useState } from "react";
import FielderButtons from "./FielderButtons";
import TypeButtons from "./TypeButtons";

type ScoringToolProps = {
  onAddOut: (type: string, count: number, display: string) => void;
  currentFieldingType: string;
  setFieldingType: (type: string) => void;
  closeTool: () => void;
};

const ScoringTool: React.FC<ScoringToolProps> = ({
  onAddOut,
  currentFieldingType,
  setFieldingType,
  closeTool,
}) => {
  const [sequence, setSequence] = useState<number[]>([]);

  const toggleFielder = (num: number) => setSequence([...sequence, num]);
  const clearSequence = () => setSequence([]);

  const addOutToCell = () => {
    if (sequence.length === 0) return;

    let outs = 1;
    if (currentFieldingType === "DP") outs = 2;
    if (currentFieldingType === "TP") outs = 3;

    const seq = sequence.join("-");
    let display = "";

    // PREFIX TYPES → F8, E5, L6
    if (["F", "E", "L"].includes(currentFieldingType)) {
      display = `${currentFieldingType}${seq}`;
    }

    // SUFFIX TYPES → 6-4-3 DP, 3U
    else if (["DP", "TP", "U"].includes(currentFieldingType)) {
      display = `${seq} ${currentFieldingType}`.trim();
    }

    // No type selected yet
    else {
      display = seq;
    }

    onAddOut(currentFieldingType, outs, display);
    clearSequence();
    setFieldingType("");
    closeTool();
  };

  // --------------------------
  // PREVIEW FORMATTER (same rules)
  // --------------------------
  const formattedPreview = (() => {
    if (sequence.length === 0) return currentFieldingType || "";

    const seq = sequence.join("-");

    switch (currentFieldingType) {
      case "F":
      case "E":
        return `${currentFieldingType}${seq}`; // F8, E5

      case "L":
        return `L${seq}`; // L6-3

      case "U":
        return `${seq} U`; // 3 U

      case "DP":
      case "TP":
        return `${seq} ${currentFieldingType}`; // 6-4-3 DP

      default:
        return seq;
    }
  })();

  return (
    <div style={{ margin: "8px 0", color: "var(--text)" }}>
      <div style={{ marginBottom: 8 }}>
        <strong>Current Fielding:</strong> {formattedPreview}
      </div>

      {/* --- TYPE BUTTONS NEXT --- */}
      <div style={{ marginBottom: 8 }}>
        <TypeButtons
          currentType={currentFieldingType}
          onSelect={setFieldingType}
        />
      </div>

      {/* --- FIELDER BUTTONS LAST --- */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ marginBottom: 4 }}>Click fielders in order:</div>
        <FielderButtons onClick={toggleFielder} />
      </div>

      {/* --- ACTION BUTTONS --- */}
      <div>
        <button
          onClick={addOutToCell}
          style={{
            marginRight: 4,
            padding: "2px 6px",
            cursor: "pointer",
            background: "var(--success)",
            color: "#0f1115",
            border: "none",
          }}
        >
          Add to Cell
        </button>

        <button
          onClick={clearSequence}
          style={{
            padding: "2px 6px",
            cursor: "pointer",
            background: "var(--danger)",
            color: "#0f1115",
            border: "none",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default ScoringTool;
