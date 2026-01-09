import React from "react";

type DiamondControlsProps = {
  showBatting: boolean;
  toggleBatting: () => void;
  showFielding: boolean;
  toggleFielding: () => void;
  clearCell: () => void;
};

const DiamondControls: React.FC<DiamondControlsProps> = ({ showBatting, toggleBatting, showFielding, toggleFielding, clearCell }) => (
  <div style={{ marginTop: 6 }}>
    <button onClick={toggleBatting} style={{ marginRight: 4, cursor: "pointer" }}>⚾ Batting</button>
    <button onClick={toggleFielding} style={{ cursor: "pointer" }}>🧢 Fielding</button>
    <button
      onClick={clearCell}
      style={{
        marginLeft: 4,
        cursor: "pointer",
        padding: "2px 6px",
        background: "var(--panel-2)",
        border: "1px solid var(--border)",
        color: "var(--text)",
      }}
    >
      Clear
    </button>
  </div>
);

export default DiamondControls;
