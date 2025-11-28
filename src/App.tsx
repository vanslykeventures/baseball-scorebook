import React, { useState } from "react";

// -------------------------------------------------------
// TYPES
// -------------------------------------------------------
type BaseState = {
  b1: boolean;
  b2: boolean;
  b3: boolean;
};

type ScoreCell = {
  result: string;
  bases: BaseState;
  scored: boolean;
};

type PlayerRow = ScoreCell[];

type TeamScorebook = {
  name: string;
  lineup: string[];
  positions: string[];
  book: PlayerRow[];
};

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------
const makeEmptyCell = (): ScoreCell => ({
  result: "",
  bases: { b1: false, b2: false, b3: false },
  scored: false,
});

const makeEmptyBook = (players: number, innings: number): PlayerRow[] =>
  Array.from({ length: players }, () =>
    Array.from({ length: innings }, () => makeEmptyCell())
  );

// -------------------------------------------------------
// DIAMOND CELL COMPONENT
// -------------------------------------------------------
type CellProps = {
  cell: ScoreCell;
  updateResult: (val: string) => void;
  toggleBase: (base: "b1" | "b2" | "b3") => void;
  advanceRunner: () => void;
  updateRun: (value?: boolean) => void;
  clearCell: () => void;
};

const DiamondCell: React.FC<CellProps> = ({
  cell,
  updateResult,
  toggleBase,
  advanceRunner,
  updateRun,
  clearCell,
}) => {
  const hasRunner = cell.bases.b1 || cell.bases.b2 || cell.bases.b3;

  // Polygons for partial hit highlights
  const hitPolygons: { [key: string]: string } = {
    "1B": "50,90 80,50 50,50 50,90",
    "BB": "50,90 80,50 50,50 50,90",
    "2B": "50,90 80,50 50,20 50,50 50,90",
    "3B": "50,90 80,50 50,20 20,50 50,50 50,90",
    "HR": "50,5 95,50 50,95 5,50", // full diamond
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* RESULT INPUT */}
      <input
        value={cell.result}
        onChange={(e) => updateResult(e.target.value)}
        placeholder="6-3, K, BB"
        style={{ width: "95%", marginBottom: 6 }}
      />

      {/* QUICK RESULT BUTTONS */}
      <div style={{ marginBottom: 6 }}>
        {["K", "BB", "1B", "2B", "3B", "HR"].map((code) => (
          <button
            key={code}
            onClick={() => updateResult(code)}
            style={{
              marginRight: 4,
              padding: "2px 6px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {code}
          </button>
        ))}
      </div>

      {/* RUN / CLEAR BUTTONS */}
      <div style={{ marginBottom: 6 }}>
        <button
          onClick={() => updateRun(true)}
          style={{
            padding: "2px 6px",
            fontSize: 12,
            background: "#ffd700",
            border: "1px solid #aa8",
            cursor: "pointer",
            marginRight: 4,
          }}
        >
          Run
        </button>
        <button
          onClick={clearCell}
          style={{
            padding: "2px 6px",
            fontSize: 12,
            background: "#eee",
            border: "1px solid #aaa",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* DIAMOND SHAPE */}
      <div
        style={{
          width: 70,
          height: 70,
          margin: "0 auto",
          userSelect: "none",
        }}
        draggable={hasRunner}
        onDragEnd={advanceRunner}
      >
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          {/* Diamond Outline */}
          <polygon
            points="50,5 95,50 50,95 5,50"
            fill={cell.result === "HR" || cell.scored ? "limegreen" : "#fff"}
            stroke="#000"
            strokeWidth="2"
          />

          {/* HIGHLIGHT FOR HITS (BB, 1B, 2B, 3B) */}
          {["1B", "BB", "2B", "3B"].includes(cell.result) && (
            <polygon
              points={hitPolygons[cell.result]}
              fill="limegreen"
              stroke="limegreen"
              strokeWidth={4}
              opacity={0.8}
            />
          )}

          {/* K display */}
          {cell.result === "K" && (
            <text
              x="50"
              y="55"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="40"
              fontWeight="bold"
              fill="red"
            >
              K
            </text>
          )}

          {/* Home Plate */}
          <polygon
            points="50,90 60,80 40,80"
            fill="#fafafa"
            stroke="#000"
            strokeWidth="2"
          />

          {/* Base nodes */}
          {[
            { base: "b1" as const, cx: 80, cy: 50 },
            { base: "b2" as const, cx: 50, cy: 20 },
            { base: "b3" as const, cx: 20, cy: 50 },
          ].map(({ base, cx, cy }) => (
            <circle
              key={base}
              cx={cx}
              cy={cy}
              r={12}
              fill={cell.bases[base] ? "#000" : "#fff"}
              stroke="#000"
              strokeWidth={2}
              onClick={(e) => {
                e.stopPropagation();
                toggleBase(base);
              }}
              style={{ cursor: "pointer" }}
            />
          ))}

          {/* Runner icons */}
          {cell.bases.b1 && <circle cx="80" cy="50" r={5} fill="yellow" />}
          {cell.bases.b2 && <circle cx="50" cy="20" r={5} fill="yellow" />}
          {cell.bases.b3 && <circle cx="20" cy="50" r={5} fill="yellow" />}
        </svg>
      </div>
    </div>
  );
};

// -------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------
const Scorekeeper: React.FC = () => {
  const innings = 9;
  const players = 9;

  const [home, setHome] = useState<TeamScorebook>({
    name: "HOME",
    lineup: Array(players).fill(""),
    positions: Array(players).fill(""),
    book: makeEmptyBook(players, innings),
  });

  const [away, setAway] = useState<TeamScorebook>({
    name: "AWAY",
    lineup: Array(players).fill(""),
    positions: Array(players).fill(""),
    book: makeEmptyBook(players, innings),
  });

  // ---------------------------
  // UPDATE FUNCTIONS
  // ---------------------------
  const updateLineup = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    idx: number,
    val: string
  ) => {
    setter((prev) => {
      const updated = [...prev.lineup];
      updated[idx] = val;
      return { ...prev, lineup: updated };
    });
  };

  const updatePosition = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    idx: number,
    val: string
  ) => {
    setter((prev) => {
      const updated = [...prev.positions];
      updated[idx] = val;
      return { ...prev, positions: updated };
    });
  };

  const updateResult = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    pIdx: number,
    iIdx: number,
    val: string
  ) => {
    setter((prev) => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) =>
          ri === pIdx && ci === iIdx ? { ...cell, result: val } : cell
        )
      );
      return { ...prev, book };
    });
  };

  const toggleBase = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    pIdx: number,
    iIdx: number,
    base: "b1" | "b2" | "b3"
  ) => {
    setter((prev) => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) =>
          ri === pIdx && ci === iIdx
            ? { ...cell, bases: { ...cell.bases, [base]: !cell.bases[base] } }
            : cell
        )
      );
      return { ...prev, book };
    });
  };

  const advanceRunner = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    pIdx: number,
    iIdx: number
  ) => {
    setter((prev) => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) => {
          if (ri !== pIdx || ci !== iIdx) return cell;
          return {
            ...cell,
            bases: {
              b3: false,
              b2: cell.bases.b3,
              b1: cell.bases.b2,
            },
          };
        })
      );
      return { ...prev, book };
    });
  };

  const updateRun = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    pIdx: number,
    iIdx: number,
    value: boolean = true
  ) => {
    setter((prev) => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) =>
          ri === pIdx && ci === iIdx ? { ...cell, scored: value } : cell
        )
      );
      return { ...prev, book };
    });
  };

  const clearCell = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    pIdx: number,
    iIdx: number
  ) => {
    setter((prev) => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) =>
          ri === pIdx && ci === iIdx ? makeEmptyCell() : cell
        )
      );
      return { ...prev, book };
    });
  };

  // -------------------------------------------------------
  // RENDER SCORE GRID
  // -------------------------------------------------------
  const renderTeamGrid = (
    team: TeamScorebook,
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>
  ) => (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #aaa", padding: 4 }}>Player</th>
          <th style={{ border: "1px solid #aaa", padding: 4 }}>Pos</th>
          {Array.from({ length: innings }).map((_, i) => (
            <th key={i} style={{ border: "1px solid #aaa", padding: 4 }}>
              {i + 1}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {team.book.map((row, pIdx) => (
          <tr key={pIdx}>
            {/* Player Name */}
            <td style={{ border: "1px solid #aaa", padding: 4 }}>
              <input
                value={team.lineup[pIdx]}
                placeholder={`Player ${pIdx + 1}`}
                onChange={(e) => updateLineup(setter, pIdx, e.target.value)}
              />
            </td>

            {/* Player Position */}
            <td style={{ border: "1px solid #aaa", padding: 4 }}>
              <input
                value={team.positions[pIdx]}
                placeholder="1, 2, 3, SS"
                onChange={(e) => updatePosition(setter, pIdx, e.target.value)}
                style={{ width: 30 }}
              />
            </td>

            {/* Inning Cells */}
            {row.map((cell, iIdx) => (
              <td key={iIdx} style={{ border: "1px solid #aaa", padding: 4 }}>
                <DiamondCell
                  cell={cell}
                  updateResult={(val) => updateResult(setter, pIdx, iIdx, val)}
                  toggleBase={(base) => toggleBase(setter, pIdx, iIdx, base)}
                  advanceRunner={() => advanceRunner(setter, pIdx, iIdx)}
                  updateRun={(value) => updateRun(setter, pIdx, iIdx, value)}
                  clearCell={() => clearCell(setter, pIdx, iIdx)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  // -------------------------------------------------------
  // MAIN RENDER
  // -------------------------------------------------------
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Old School Baseball Scorekeeper</h1>

      <h2>Away</h2>
      {renderTeamGrid(away, setAway)}

      <h2 style={{ marginTop: 40 }}>Home</h2>
      {renderTeamGrid(home, setHome)}
    </div>
  );
};

export default Scorekeeper;
