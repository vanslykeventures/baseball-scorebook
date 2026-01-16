import React from "react";

type DiamondSVGProps = {
  cellResult: string;
  bases: { b1: boolean; b2: boolean; b3: boolean };
  scored: boolean;
};

const hitPolygons: { [key: string]: string } = {
  "1B": "50,90 80,50 50,50 50,90",
  "BB": "50,90 80,50 50,50 50,90",
  "2B": "50,90 80,50 50,20 50,50 50,90",
  "3B": "50,90 80,50 50,20 20,50 50,50 50,90",
  "HR": "50,5 95,50 50,95 5,50",
};

const DiamondSVG: React.FC<DiamondSVGProps> = ({ cellResult, bases, scored }) => (
  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
    <polygon
      points="50,5 95,50 50,95 5,50"
      fill={cellResult === "HR" || scored ? "var(--accent-2)" : "var(--diamond-bg)"}
      stroke="var(--diamond-stroke)"
      strokeWidth="2"
    />
    {["1B", "BB", "2B", "3B"].includes(cellResult) && (
      <polygon
        points={hitPolygons[cellResult]}
        fill="var(--accent-2)"
        stroke="var(--accent-2)"
        strokeWidth={4}
        opacity={0.8}
      />
    )}
    {["K", "ꓘ"].includes(cellResult) && (
      <text
        x="50"
        y="55"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="40"
        fontWeight="bold"
        fill="var(--danger)"
      >
        {cellResult}
      </text>
    )}
    <polygon
      points="50,90 60,80 40,80"
      fill="var(--homeplate-bg)"
      stroke="var(--diamond-stroke)"
      strokeWidth="2"
    />
  </svg>
);

export default DiamondSVG;
