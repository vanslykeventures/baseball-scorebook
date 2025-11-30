import React from "react";

type TypeButtonsProps = {
  currentType: string;
  onSelect: (type: string) => void;
};

const TypeButtons: React.FC<TypeButtonsProps> = ({ currentType, onSelect }) => (
  <div style={{ marginBottom: 4 }}>
    {["F", "E", "DP", "TP"].map((type) => (
      <button
        key={type}
        onClick={() => onSelect(type)}
        style={{
          marginRight: 4,
          padding: "2px 6px",
          cursor: "pointer",
          fontWeight: currentType === type ? "bold" : "normal",
        }}
      >
        {type}
      </button>
    ))}
  </div>
);

export default TypeButtons;
