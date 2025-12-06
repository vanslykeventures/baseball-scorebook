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
};

const DiamondCell: React.FC<DiamondCellProps> = ({
  cell,
  totalOuts,
  inningOver,
  updateResult,
  advanceRunner,
  updateRun,
  clearCell,
  addOut
}) => {
  const [fieldingType, setFieldingType] = useState<string>(cell.fieldingType || "");
  const [showBattingTools, setShowBattingTools] = useState(false);
  const [showFieldingTools, setShowFieldingTools] = useState(false);

  const disabled = inningOver; // inning has reached 3 outs

  const hitPolygons: { [key: string]: string } = {
    "1B": "50,90 80,50 50,50 50,90",
    "BB": "50,90 80,50 50,50 50,90",
    "2B": "50,90 80,50 50,20 50,50 50,90",
    "3B": "50,90 80,50 50,20 20,50 50,50 50,90",
    "HR": "50,5 95,50 50,95 5,50",
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
      case "ꓘ":
        cell.outs = 1;
        break;
      default:
        cell.bases = { b1: false, b2: false, b3: false };
    }
  };

  const flags = totalOuts; // cumulative inning outs

  return (
    <div
      style={{
        textAlign: "center",
        position: "relative",
        opacity: disabled ? 0.40 : 1.0, // grey out if inning finished
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      {(cell.result || cell.fieldingDisplay) && (
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>
          {cell.result} {cell.fieldingDisplay || ""}
        </div>
      )}

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

      <div
        style={{ width: 70, height: 70, margin: "0 auto", userSelect: "none" }}
        draggable={!disabled}
        onDragEnd={!disabled ? advanceRunner : undefined}
      >
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <polygon
            points="50,5 95,50 50,95 5,50"
            fill={cell.result === "HR" || cell.scored ? "limegreen" : "#fff"}
            stroke="#000"
            strokeWidth="2"
          />

          {["1B", "BB", "2B", "3B"].includes(cell.result) && (
            <polygon
              points={hitPolygons[cell.result]}
              fill="limegreen"
              stroke="limegreen"
              strokeWidth={4}
              opacity={0.8}
            />
          )}

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

          <polygon
            points="50,90 60,80 40,80"
            fill="#fafafa"
            stroke="#000"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div style={{ marginTop: 6 }}>
        <button
          onClick={() => setShowBattingTools((prev) => !prev)}
          style={{ marginRight: 4, cursor: "pointer" }}
        >
          ⚾ Batting
        </button>
        <button
          onClick={() => setShowFieldingTools((prev) => !prev)}
          style={{ cursor: "pointer" }}
        >
          🧢 Fielding
        </button>
        <button
          onClick={clearCell}
          style={{
            marginLeft: 4,
            cursor: "pointer",
            padding: "2px 6px",
            background: "#eee",
            border: "1px solid #aaa",
          }}
        >
          Clear
        </button>
      </div>

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
