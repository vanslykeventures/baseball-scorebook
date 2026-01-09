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
        gap: 20,
        padding: "8px 12px",
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
      <span>R: {runs}</span>
      <span>H: {hits}</span>
      <span>E: {errors}</span>
    </div>
  );
};

export default ScoreBug;
