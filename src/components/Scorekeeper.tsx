import React, { useState } from "react";
import DiamondCell from "./DiamondCell/DiamondCell";
import { makeEmptyBook, makeEmptyCell, type TeamScorebook } from "../../types";

const Scorekeeper: React.FC = () => {
  const innings = 9;
  const players = 9;

  // Track which innings are completed
  const [completedInnings, setCompletedInnings] = useState<boolean[]>(
    Array(innings).fill(false)
  );

  // Away team
  const [away, setAway] = useState<TeamScorebook>({
    name: "AWAY",
    lineup: Array(players).fill(""),
    positions: Array(players).fill(""),
    book: makeEmptyBook(players, innings),
  });

  // HOME team if needed
  const [home, setHome] = useState<TeamScorebook>({
    name: "HOME",
    lineup: Array(players).fill(""),
    positions: Array(players).fill(""),
    book: makeEmptyBook(players, innings),
  });

  const updateResult = (setter, pIdx, iIdx, val) => {
    setter(prev => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) =>
          ri === pIdx && ci === iIdx ? { ...cell, result: val } : cell
        )
      );
      return { ...prev, book };
    });
  };

  const advanceRunner = (setter, pIdx, iIdx) => {
    setter(prev => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) => {
          if (ri !== pIdx || ci !== iIdx) return cell;
          return {
            ...cell,
            bases: {
              b3: false,
              b2: cell.bases.b3,
              b1: cell.bases.b2
            }
          };
        })
      );
      return { ...prev, book };
    });
  };

  const updateRun = (setter, pIdx, iIdx, val) => {
    setter(prev => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) =>
          ri === pIdx && ci === iIdx ? { ...cell, scored: true } : cell
        )
      );
      return { ...prev, book };
    });
  };

  const clearCell = (setter, pIdx, iIdx) => {
    setter(prev => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) =>
          ri === pIdx && ci === iIdx ? makeEmptyCell() : cell
        )
      );
      return { ...prev, book };
    });
  };

  const completeInning = (iIdx) => {
    const updated = [...completedInnings];
    updated[iIdx] = true;
    setCompletedInnings(updated);
  };

  // Main render grid
  const renderTeamGrid = (team, setter) => (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ccc" }}>Player</th>
          <th style={{ border: "1px solid #ccc" }}>Pos</th>
          {Array.from({ length: innings }).map((_, i) => (
            <th key={i} style={{ border: "1px solid #ccc" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {i + 1}
                {/* Show button when a column reaches 3 outs */}
                {(() => {
                  let totalOuts = 0;
                  for (let p = 0; p < players; p++) {
                    const cell = team.book[p][i];
                    if (cell?.outs) totalOuts += cell.outs;
                  }
                  if (totalOuts >= 3 && !completedInnings[i]) {
                    return (
                      <button
                        style={{
                          marginTop: 4,
                          background: "orange",
                          padding: "2px 6px",
                          borderRadius: 4
                        }}
                        onClick={() => completeInning(i)}
                      >
                        Complete Inning?
                      </button>
                    );
                  }
                })()}
              </div>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {team.book.map((row, pIdx) => (
          <tr key={pIdx}>
            {/* Player name */}
            <td style={{ border: "1px solid #ccc" }}>
              <input
                value={team.lineup[pIdx]}
                onChange={(e) =>
                  setter(prev => {
                    const updated = [...prev.lineup];
                    updated[pIdx] = e.target.value;
                    return { ...prev, lineup: updated };
                  })
                }
              />
            </td>

            {/* Position */}
            <td style={{ border: "1px solid #ccc" }}>
              <input
                value={team.positions[pIdx]}
                style={{ width: 30 }}
                onChange={(e) =>
                  setter(prev => {
                    const updated = [...prev.positions];
                    updated[pIdx] = e.target.value;
                    return { ...prev, positions: updated };
                  })
                }
              />
            </td>

            {/* Inning cells */}
            {row.map((cell, iIdx) => {
              // compute cumulative outs
              let totalOuts = 0;
              for (let p = 0; p <= pIdx; p++) {
                const c = team.book[p][iIdx];
                if (c?.outs) totalOuts += c.outs;
              }
              if (totalOuts > 3) totalOuts = 3;

              const inningOver = completedInnings[iIdx];

              return (
                <td key={iIdx} style={{ border: "1px solid #ccc", padding: 4 }}>
                  <DiamondCell
                    cell={cell}
                    totalOuts={totalOuts}
                    inningOver={inningOver}
                    updateResult={(val) => updateResult(setter, pIdx, iIdx, val)}
                    advanceRunner={() => advanceRunner(setter, pIdx, iIdx)}
                    updateRun={(v) => updateRun(setter, pIdx, iIdx, v)}
                    clearCell={() => clearCell(setter, pIdx, iIdx)}
                    addOut={(type, count, display) =>
                      setter(prev => {
                        const book = prev.book.map((row2, ri) =>
                          row2.map((c2, ci) =>
                            ri === pIdx && ci === iIdx
                              ? { ...c2, outs: count, fieldingType: type, fieldingDisplay: display }
                              : c2
                          )
                        );
                        return { ...prev, book };
                      })
                    }
                    addAdvance={(route) =>
                      setter(prev => {
                        const book = prev.book.map((row2, ri) =>
                          row2.map((c2, ci) =>
                            ri === pIdx && ci === iIdx
                              ? { ...c2, advances: [...(c2.advances || []), route] }
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
    </div>
  );
};

export default Scorekeeper;
