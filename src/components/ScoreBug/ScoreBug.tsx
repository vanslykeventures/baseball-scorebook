import React from "react";

interface ScoreBugProps {
  runs: number;
  hits: number;
  errors: number;
  teamName: string;
}

const ScoreBug: React.FC<ScoreBugProps> = ({ runs, hits, errors, teamName }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 16px",
        minWidth: 240,
        background: "var(--scorebug-bg)",
        color: "var(--text)",
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 10,
        borderRadius: 8,
        border: "1px solid var(--border)",
      }}
    >
      <span>{teamName}</span>
      <span>
        R: {runs} &nbsp; H: {hits} &nbsp; E: {errors}
      </span>
    </div>
  );
};

export default ScoreBug;
