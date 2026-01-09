import React from "react";

type FielderButtonsProps = {
  onClick: (num: number) => void;
};

const FielderButtons: React.FC<FielderButtonsProps> = ({ onClick }) => (
  <div style={{ marginBottom: 4 }}>
    {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
      <button
        key={num}
        onClick={() => onClick(num)}
        style={{ marginRight: 4, padding: "4px 6px", cursor: "pointer", fontWeight: "bold" }}
      >
        {num}
      </button>
    ))}
  </div>
);

export default FielderButtons;
