import React, { useState } from "react";
import type { ScoreCell } from "../../../types";
import ScoringTool from "../ScoringTool/ScoringTool";

type DiamondCellProps = {
  cell: ScoreCell;
  totalOuts: number;
  inningOver: boolean;
  updateResult: (val: string) => void;
  advanceRunner: () => void;
  updateRun: (value?: boolean) => void;
  clearCell: () => void;
  addOut: (type: string, count: number, display: string) => void;
  updateAdvances: (route: string) => void;
};

const DiamondCell: React.FC<DiamondCellProps> = ({
  cell,
  totalOuts,
  inningOver,
  updateResult,
  advanceRunner,
  updateRun,
  clearCell,
  addOut,
  updateAdvances
}) => {
  const [fieldingType, setFieldingType] = useState<string>(
    cell.fieldingType || ""
  );
  const [showBattingTools, setShowBattingTools] = useState(false);
  const [showFieldingTools, setShowFieldingTools] = useState(false);
  const [showAdvanceTools, setShowAdvanceTools] = useState(false);

  const disabled = inningOver;

  // GREEN HIT POLYGONS (unchanged)
  const hitPolygons: { [key: string]: string } = {
    "1B": "50,90 80,50 50,50 50,90",
    "BB": "50,90 80,50 50,50 50,90",
    "2B": "50,90 80,50 50,20 50,50 50,90",
    "3B": "50,90 80,50 50,20 20,50 50,50 50,90",
    "HR": "50,5 95,50 50,95 5,50",
  };

  const handleReset = () => {
    // Close all dropdowns
    setShowBattingTools(false);
    setShowFieldingTools(false);
    setShowAdvanceTools(false);
  
    // Reset all cell properties
    cell.result = "";
    cell.fieldingType = "";
    cell.fieldingDisplay = "";
    cell.outs = 0;
    cell.bases = { b1: false, b2: false, b3: false };
    cell.scored = false;
    cell.advances = [];
  
    // Notify parent to reset stored state
    clearCell();
  };
  

  // ORANGE ADVANCEMENT POLYGONS
  // These are *segments from the current base*, not from home.
  // All shapes are built around the center (50,50), matching your diamond.
  const advancePolygons: { [route: string]: string[] } = {
    // single-base advances
    "1-2": ["50,50 80,50 50,20 50,50"], // top-right quadrant
    "2-3": ["50,50 50,20 20,50 50,50"], // top-left quadrant
    "3-H": ["50,50 20,50 50,90 50,50"], // bottom-left quadrant

    // multi-base advances (unions of the above)
    "1-3": [
      "50,50 80,50 50,20 50,50", // 1->2
      "50,50 50,20 20,50 50,50", // 2->3
    ],
    "2-H": [
      "50,50 50,20 20,50 50,50", // 2->3
      "50,50 20,50 50,90 50,50", // 3->H
    ],
    "1-H": [
      "50,50 80,50 50,20 50,50", // 1->2
      "50,50 50,20 20,50 50,50", // 2->3
      "50,50 20,50 50,90 50,50", // 3->H
    ],
  };

  const handleResult = (res: string) => {
    if (disabled) return;

    updateResult(res);
    switch (res) {
      case "1B":
      case "BB":
        cell.bases = { b1: true, b2: false, b3: false };
        break;
      case "2B":
        cell.bases = { b1: false, b2: true, b3: false };
        break;
      case "3B":
        cell.bases = { b1: false, b2: false, b3: true };
        break;
      case "HR":
        cell.bases = { b1: true, b2: true, b3: true };
        cell.scored = true;
        break;
      case "K":
        cell.outs = 1;
        addOut("K", 1, "K");
        cell.fieldingDisplay = ""
        break;
      case "ꓘ":
        cell.outs = 1;
        addOut("ꓘ", 1, "ꓘ");
        cell.fieldingDisplay = ""
        break;
      default:
        cell.bases = { b1: false, b2: false, b3: false };
    }
  };

  const flags = totalOuts;

  const handleAdvance = (route: string) => {
    if (inningOver) return;
    // Let the parent update the cell's advances array (stacking)

    // Add the advance to the cell
    updateAdvances(route);

    // Any advance ending in H is a run
    if (route.endsWith("H")) {
      updateRun(true);  // marks the cell as a run
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        position: "relative",
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      {(cell.result || cell.fieldingDisplay) && (
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>
          {cell.fieldingDisplay ? cell.fieldingDisplay : cell.result}
        </div>
      
      )}

      {/* OUT FLAG */}
      {(cell.outs || cell.result || cell.fieldingDisplay) && flags > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 16,
            height: 16,
            background: "red",
            borderRadius: "50%",
            textAlign: "center",
            color: "#fff",
            fontSize: 12,
            fontWeight: "bold",
            lineHeight: "16px",
          }}
        >
          {flags}
        </div>
      )}

      {/* DIAMOND SVG */}
      <div
        style={{ width: 70, height: 70, margin: "0 auto", userSelect: "none" }}
        draggable={!disabled}
        onDragEnd={!disabled ? advanceRunner : undefined}
      >
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          {/* Base diamond */}
          <polygon
            points="50,5 95,50 50,95 5,50"
            fill={cell.result === "HR" || cell.scored ? "limegreen" : "#fff"}
            stroke="#000"
            strokeWidth="2"
          />

          {/* Green hit wedge */}
          {["1B", "BB", "2B", "3B"].includes(cell.result) && (
            <polygon
              points={hitPolygons[cell.result]}
              fill="limegreen"
              stroke="limegreen"
              strokeWidth={4}
              opacity={0.8}
            />
          )}

          {/* Orange advancement wedges */}
          {cell.advances?.flatMap((route, idx) =>
            (advancePolygons[route] || []).map((poly, j) => (
              <polygon
                key={`${idx}-${j}`}
                points={poly}
                fill="orange"
                stroke="orange"
                strokeWidth={4}
                opacity={0.7}
              />
            ))
          )}

          {/* Strikeout text */}
          {["K", "ꓘ"].includes(cell.result) && (
            <text
              x="50"
              y="55"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="40"
              fontWeight="bold"
              fill="red"
            >
              {cell.result}
            </text>
          )}

          {/* Home plate */}
          <polygon
            points="50,90 60,80 40,80"
            fill="#fafafa"
            stroke="#000"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* CONTROL BUTTONS */}
      <div style={{ marginTop: 6 }}>
        <button
          onClick={() => setShowBattingTools((p) => !p)}
          style={{ marginRight: 4, cursor: "pointer" }}
        >
          ⚾ Batting
        </button>

        <button
          onClick={() => setShowAdvanceTools((p) => !p)}
          style={{ marginRight: 4, cursor: "pointer" }}
        >
          🔶 Advance
        </button>

        <button
          onClick={() => setShowFieldingTools((p) => !p)}
          style={{ cursor: "pointer" }}
        >
          🧢 Fielding
        </button>
<br></br>
        <button
          onClick={handleReset}
          style={{
            marginLeft: 4,
            cursor: "pointer",
            padding: "2px 6px",
            background: "#eee",
            border: "1px solid #aaa",
          }}
        >
          Reset
        </button>
      </div>

      {/* Batting tools */}
      {showBattingTools && !disabled && (
        <div style={{ marginTop: 4 }}>
          {["K", "ꓘ", "BB", "1B", "2B", "3B", "HR"].map((code) => (
            <button
              key={code}
              onClick={() => handleResult(code)}
              style={{ marginRight: 4, padding: "2px 6px", fontSize: 12 }}
            >
              {code}
            </button>
          ))}
          <button
            onClick={() => updateRun(true)}
            style={{
              padding: "2px 6px",
              fontSize: 12,
              background: "#ffd700",
              border: "1px solid #aa8",
              marginLeft: 4,
            }}
          >
            Run
          </button>
        </div>
      )}

      {/* Advancement tools – buttons now neutral, not orange blocks */}
      {showAdvanceTools && !disabled && (
        <div style={{ marginTop: 6 }}>
          {["1-2", "2-3", "3-H", "1-3", "2-H", "1-H"].map((route) => (
            <button
              key={route}
              onClick={() => handleAdvance(route)}
              style={{
                margin: "2px 4px",
                padding: "2px 8px",
                fontSize: 11,
                cursor: "pointer",
                background: "#eee",
                border: "1px solid #aaa",
                borderRadius: 4,
              }}
            >
              {route.replace("-", " → ")}
            </button>
          ))}
        </div>
      )}

      {/* Fielding tools */}
      {showFieldingTools && !disabled && (
        <ScoringTool
          onAddOut={(type, count, display) => {
            cell.outs = count;
            addOut(type, count, display);
            cell.fieldingType = type;
            cell.fieldingDisplay = display;
          }}
          currentFieldingType={fieldingType}
          setFieldingType={setFieldingType}
          closeTool={() => setShowFieldingTools(false)}
        />
      )}
    </div>
  );
};

export default DiamondCell;
