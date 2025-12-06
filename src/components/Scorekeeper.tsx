import React, { useState } from "react";
import DiamondCell from "./DiamondCell/DiamondCell";
import { makeEmptyCell, makeEmptyBook, type TeamScorebook } from "../../types";

const Scorekeeper: React.FC = () => {
  const innings = 9;
  const players = 9;

  // Track which innings are completed and locked
  const [completedInnings, setCompletedInnings] = useState<boolean[]>(
    Array(innings).fill(false)
  );

  const [away, setAway] = useState<TeamScorebook>({
    name: "AWAY",
    lineup: Array(players).fill(""),
    positions: Array(players).fill(""),
    book: makeEmptyBook(players, innings),
  });

  const [home, setHome] = useState<TeamScorebook>({
    name: "HOME",
    lineup: Array(players).fill(""),
    positions: Array(players).fill(""),
    book: makeEmptyBook(players, innings),
  });

  // ------------------------------
  // UPDATE FUNCTIONS
  // ------------------------------
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
        row.map((cell, ci) =>
          ri === pIdx && ci === iIdx ? makeEmptyCell() : cell
        )
      );
      return { ...prev, book };
    });
  };

  // ------------------------------
  // RENDER GRID
  // ------------------------------
  const renderTeamGrid = (
    team: TeamScorebook,
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>
  ) => (
    <table
      style={{
        borderCollapse: "collapse",
        width: "100%",
        border: "1px solid #aaa",
      }}
    >
      <thead>
        <tr>
          <th style={{ border: "1px solid #aaa", padding: 4 }}>Player</th>
          <th style={{ border: "1px solid #aaa", padding: 4 }}>Pos</th>

          {Array.from({ length: innings }).map((_, i) => (
            <th key={i} style={{ border: "1px solid #aaa", padding: 4 }}>
              {i + 1}
              {/* Show Complete Inning button if 3 outs reached and not already closed */}
              {(() => {
                // Count total outs in this inning
                let totalOuts = 0;
                team.book.forEach((row) => {
                  const c = row[i];
                  if (c?.outs) totalOuts += c.outs;
                });

                if (totalOuts >= 3 && !completedInnings[i]) {
                  return (
                    <div style={{ marginTop: 4 }}>
                      <button
                        onClick={() =>
                          setCompletedInnings((prev) => {
                            const updated = [...prev];
                            updated[i] = true;
                            return updated;
                          })
                        }
                        style={{
                          fontSize: 10,
                          padding: "2px 4px",
                          cursor: "pointer",
                          background: "#ddd",
                          border: "1px solid #888",
                        }}
                      >
                        Complete Inning?
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {team.book.map((row, pIdx) => (
          <tr key={pIdx}>
            {/* Player name */}
            <td style={{ border: "1px solid #aaa", padding: 4 }}>
              <input
                value={team.lineup[pIdx]}
                onChange={(e) => {
                  const v = e.target.value;
                  setter((prev) => ({
                    ...prev,
                    lineup: prev.lineup.map((n, i) => (i === pIdx ? v : n)),
                  }));
                }}
              />
            </td>

            {/* Position */}
            <td style={{ border: "1px solid #aaa", padding: 4 }}>
              <input
                value={team.positions[pIdx]}
                onChange={(e) => {
                  const v = e.target.value;
                  setter((prev) => ({
                    ...prev,
                    positions: prev.positions.map((n, i) =>
                      i === pIdx ? v : n
                    ),
                  }));
                }}
                style={{ width: 30 }}
              />
            </td>

            {/* Inning cells */}
            {row.map((cell, iIdx) => {
              // Compute running outs through all *previous rows* in the same inning
              let totalOuts = 0;
              for (let r = 0; r <= pIdx; r++) {
                const c = team.book[r][iIdx];
                if (c?.outs) totalOuts += c.outs;
              }

              if (totalOuts > 3) totalOuts = 3; // cap at 3 outs

              return (
                <td
                  key={iIdx}
                  style={{
                    border: "1px solid #aaa",
                    padding: 4,
                    background: completedInnings[iIdx] ? "#e0e0e0" : "white",
                    opacity: completedInnings[iIdx] ? 0.6 : 1,
                    pointerEvents: completedInnings[iIdx] ? "none" : "auto",
                  }}
                >
                  <DiamondCell
                    cell={cell}
                    totalOuts={totalOuts}
                    inningOver={completedInnings[iIdx]}
                    updateResult={(val) =>
                      updateResult(setter, pIdx, iIdx, val)
                    }
                    advanceRunner={() =>
                      advanceRunner(setter, pIdx, iIdx)
                    }
                    updateRun={(val) => updateRun(setter, pIdx, iIdx, true)}
                    clearCell={() => clearCell(setter, pIdx, iIdx)}
                    addOut={(type, count, display) =>
                      setter((prev) => {
                        const book = prev.book.map((row2, ri) =>
                          row2.map((c2, ci) =>
                            ri === pIdx && ci === iIdx
                              ? {
                                  ...c2,
                                  outs: count,
                                  fieldingType: type,
                                  fieldingDisplay: display,
                                }
                              : c2
                          )
                        );
                        return { ...prev, book };
                      })
                    }
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>Old School Baseball Scorekeeper</h1>

      <h2>Away</h2>
      {renderTeamGrid(away, setAway)}

      {/* Uncomment if you want home team */}
      {/* <h2 style={{ marginTop: 40 }}>Home</h2>
      {renderTeamGrid(home, setHome)} */}
    </div>
  );
};

export default Scorekeeper;
