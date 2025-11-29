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
  fieldingType?: string;
  outs?: number;
  fieldingDisplay?: string; // Added to store the full fielding log string
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
  fieldingType: "",
  outs: 0,
  fieldingDisplay: "",
});

const makeEmptyBook = (players: number, innings: number): PlayerRow[] =>
  Array.from({ length: players }, () =>
    Array.from({ length: innings }, () => makeEmptyCell())
  );

// -------------------------------------------------------
// MINI SCORING TOOL
// -------------------------------------------------------
type ScoringToolProps = {
  onAddOut: (type: string, count: number, display: string) => void;
  currentFieldingType: string;
  setFieldingType: (type: string) => void;
};

const ScoringTool: React.FC<ScoringToolProps> = ({
  onAddOut,
  currentFieldingType,
  setFieldingType,
}) => {
  const [sequence, setSequence] = useState<number[]>([]);

  const toggleFielder = (num: number) => setSequence([...sequence, num]);
  const clearSequence = () => setSequence([]);

  const addOutToCell = () => {
    if (sequence.length === 0) return;
    let outs = 1;
    if (currentFieldingType === "DP") outs = 2;
    if (currentFieldingType === "TP") outs = 3;

    const display = `${sequence.join("-")} ${currentFieldingType}`;
    onAddOut(currentFieldingType, outs, display);
    clearSequence();
    setFieldingType("");
  };

  return (
    <div style={{ margin: "8px 0", fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: 4 }}>Click fielders in order:</div>
      <div style={{ marginBottom: 4 }}>
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => toggleFielder(num)}
            style={{
              marginRight: 4,
              padding: "4px 6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {num}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 4 }}>
        <strong>Current Out:</strong>{" "}
        {sequence.length > 0 ? sequence.join("-") : ""}
        {currentFieldingType ? ` ${currentFieldingType}` : ""}
      </div>

      {/* Fielding type buttons */}
      <div style={{ marginBottom: 4 }}>
        {["F", "E", "DP", "TP"].map((type) => (
          <button
            key={type}
            onClick={() => setFieldingType(type)}
            style={{
              marginRight: 4,
              padding: "2px 6px",
              cursor: "pointer",
              fontWeight: currentFieldingType === type ? "bold" : "normal",
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div>
        <button
          onClick={addOutToCell}
          style={{
            marginRight: 4,
            padding: "2px 6px",
            cursor: "pointer",
            background: "#4CAF50",
            color: "#fff",
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
            background: "#f44336",
            color: "#fff",
            border: "none",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------
// DIAMOND CELL COMPONENT
// -------------------------------------------------------
type CellProps = {
  cell: ScoreCell;
  updateResult: (val: string) => void;
  advanceRunner: () => void;
  updateRun: (value?: boolean) => void;
  clearCell: () => void;
  addOut: (type: string, count: number, display: string) => void;
};

const DiamondCell: React.FC<CellProps> = ({
  cell,
  updateResult,
  advanceRunner,
  updateRun,
  clearCell,
  addOut,
}) => {
  const [fieldingType, setFieldingType] = useState<string>(cell.fieldingType || "");
  const [showBattingTools, setShowBattingTools] = useState(false);
  const [showOutTools, setShowOutTools] = useState(false);

  const hitPolygons: { [key: string]: string } = {
    "1B": "50,90 80,50 50,50 50,90",
    "BB": "50,90 80,50 50,50 50,90",
    "2B": "50,90 80,50 50,20 50,50 50,90",
    "3B": "50,90 80,50 50,20 20,50 50,50 50,90",
    "HR": "50,5 95,50 50,95 5,50",
  };

  const handleResult = (res: string) => {
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
      default:
        cell.bases = { b1: false, b2: false, b3: false };
    }
  };

  const hasRunner = cell.bases.b1 || cell.bases.b2 || cell.bases.b3;
  const flags = cell.outs || 0;

  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      {/* Show result on top */}
      {(cell.result || cell.fieldingDisplay) && (
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>
          {cell.result} {cell.fieldingDisplay || ""}
        </div>
      )}

      {/* RED FLAG OUTS */}
      {flags > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 12,
            height: 12,
            background: "red",
            borderRadius: "50%",
            textAlign: "center",
            color: "#fff",
            fontSize: 10,
            fontWeight: "bold",
            lineHeight: "12px",
          }}
        >
          {flags}
        </div>
      )}

      {/* DIAMOND */}
      <div
        style={{ width: 70, height: 70, margin: "0 auto", userSelect: "none" }}
        draggable={hasRunner}
        onDragEnd={advanceRunner}
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
          <polygon points="50,90 60,80 40,80" fill="#fafafa" stroke="#000" strokeWidth="2" />
        </svg>
      </div>

      {/* DROPDOWN TOGGLES */}
      <div style={{ marginTop: 6 }}>
        <button
          onClick={() => setShowBattingTools((prev) => !prev)}
          style={{ marginRight: 4, cursor: "pointer" }}
        >
          ⚾ Batting
        </button>
        <button
          onClick={() => setShowOutTools((prev) => !prev)}
          style={{ cursor: "pointer" }}
        >
          🧢 Outs
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

      {/* BATTER TOOLS */}
      {showBattingTools && (
        <div style={{ marginTop: 4 }}>
          {["K", "ꓘ", "BB", "1B", "2B", "3B", "HR"].map((code) => (
            <button
              key={code}
              onClick={() => handleResult(code)}
              style={{ marginRight: 4, padding: "2px 6px", fontSize: 12, cursor: "pointer" }}
            >
              {code}
            </button>
          ))}
          <button
            onClick={() => updateRun(true)}
            style={{ padding: "2px 6px", fontSize: 12, background: "#ffd700", border: "1px solid #aa8", cursor: "pointer", marginLeft: 4 }}
          >
            Run
          </button>
        </div>
      )}

      {/* OUT/FIELDING TOOLS */}
      {showOutTools && (
        <ScoringTool
          onAddOut={(type, count, display) => {
            cell.outs = (cell.outs || 0) + count;
            addOut(type, cell.outs || 0, display);
            cell.fieldingType = type;
            cell.fieldingDisplay = display;
          }}
          currentFieldingType={fieldingType}
          setFieldingType={setFieldingType}
        />
      )}
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
        row.map((cell, ci) => (ri === pIdx && ci === iIdx ? makeEmptyCell() : cell))
      );
      return { ...prev, book };
    });
  };

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
            <td style={{ border: "1px solid #aaa", padding: 4 }}>
              <input
                value={team.lineup[pIdx]}
                placeholder={`Player ${pIdx + 1}`}
                onChange={(e) => updateLineup(setter, pIdx, e.target.value)}
              />
            </td>
            <td style={{ border: "1px solid #aaa", padding: 4 }}>
              <input
                value={team.positions[pIdx]}
                placeholder="1,2,3,SS"
                onChange={(e) => updatePosition(setter, pIdx, e.target.value)}
                style={{ width: 30 }}
              />
            </td>
            {row.map((cell, iIdx) => (
              <td key={iIdx} style={{ border: "1px solid #aaa", padding: 4 }}>
                <DiamondCell
                  cell={cell}
                  updateResult={(val) => updateResult(setter, pIdx, iIdx, val)}
                  advanceRunner={() => advanceRunner(setter, pIdx, iIdx)}
                  updateRun={(value) => updateRun(setter, pIdx, iIdx, value)}
                  clearCell={() => clearCell(setter, pIdx, iIdx)}
                  addOut={(type, count, display) => {
                    setter(prev => {
                      const book = prev.book.map((row, ri) =>
                        row.map((c, ci) => {
                          if (ri === pIdx && ci === iIdx) {
                            return { ...c, outs: (c.outs || 0) + count, fieldingType: type, fieldingDisplay: display };
                          }
                          return c;
                        })
                      );
                      return { ...prev, book };
                    });
                  }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

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
