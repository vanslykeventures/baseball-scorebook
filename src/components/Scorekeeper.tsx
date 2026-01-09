import React, { useState } from "react";
import DiamondCell from "./DiamondCell/DiamondCell";
import { makeEmptyCell, makeEmptyBook, type TeamScorebook } from "../../types";
import ScoreBug from "./ScoreBug/ScoreBug";

const Scorekeeper: React.FC = () => {
  const defaultInnings = 3;
  const defaultPlayers = 9;

  // -------------------------
  // AWAY TEAM STATE
  // -------------------------
  const [away, setAway] = useState<TeamScorebook>({
    name: "AWAY",
    lineup: Array(defaultPlayers).fill(""),
    positions: Array(defaultPlayers).fill(""),
    book: makeEmptyBook(defaultPlayers, defaultInnings),
  });

  const [awayInnings, setAwayInnings] = useState(defaultInnings);
  const [awayCompletedInnings, setAwayCompletedInnings] = useState<boolean[]>(
    Array(defaultInnings).fill(false)
  );
  const [awayPlayersCount, setAwayPlayersCount] = useState(defaultPlayers);
  const [awayCollapsedInnings, setAwayCollapsedInnings] = useState<boolean[]>(
    Array(defaultInnings).fill(false)
  );

  // -------------------------
  // HOME TEAM STATE
  // -------------------------
  const [home, setHome] = useState<TeamScorebook>({
    name: "HOME",
    lineup: Array(defaultPlayers).fill(""),
    positions: Array(defaultPlayers).fill(""),
    book: makeEmptyBook(defaultPlayers, defaultInnings),
  });

  const [homeInnings, setHomeInnings] = useState(defaultInnings);
  const [homeCompletedInnings, setHomeCompletedInnings] = useState<boolean[]>(
    Array(defaultInnings).fill(false)
  );
  const [homePlayersCount, setHomePlayersCount] = useState(defaultPlayers);
  const [homeCollapsedInnings, setHomeCollapsedInnings] = useState<boolean[]>(
    Array(defaultInnings).fill(false)
  );

  // -------------------------
  // CLOSE OTHER CELLS' PANELS
  // -------------------------
  const [globalToggle, setGlobalToggle] = useState(0);
  const closeAllPanels = () => setGlobalToggle((n) => n + 1);

  // -------------------------
  // SCOREBUG COMPUTATION
  // -------------------------
  const computeStats = (team: TeamScorebook) => {
    let runs = 0;
    let hits = 0;
    let errors = 0;

    team.book.forEach((row) => {
      row.forEach((cell) => {
        if (!cell) return;

        // Runs
        if (cell.scored) runs++;

        // Hits
        if (["1B", "2B", "3B", "HR"].includes(cell.result)) hits++;

        // Errors (fielding type = "E")
        if (cell.fieldingType === "E") errors++;
      });
    });

    return { runs, hits, errors };
  };
  const awayStats = computeStats(away);
  const homeStats = computeStats(home);

  // -------------------------
  // GRID RENDERER
  // -------------------------
  const renderTeamGrid = (
    team: TeamScorebook,
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    inningsCount: number,
    completedInnings: boolean[],
    setCompletedInnings: React.Dispatch<React.SetStateAction<boolean[]>>,
    playersCount: number,
    setPlayersCount: React.Dispatch<React.SetStateAction<number>>,
    collapsedInnings: boolean[],
    setCollapsedInnings: React.Dispatch<React.SetStateAction<boolean[]>>,
    setInningsCount: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        {/* HEADER */}
        <thead>
          <tr>
            <th style={{ width: 120 }}>Player</th>
            <th style={{ width: 40 }}>Pos</th>

            {Array.from({ length: inningsCount }).map((_, i) => (
              <th
                key={i}
                onClick={() =>
                  setCollapsedInnings((prev) =>
                    prev.map((c, idx) => (idx === i ? !c : c))
                  )
                }
                style={{
                  cursor: "pointer",
                  background: collapsedInnings[i] ? "#ddd" : "#f8f8f8",
                  userSelect: "none",
                  padding: "4px 8px",
                  border: "1px solid #aaa",
                }}
              >
                {i + 1}
              </th>
            ))}

            <th>
              <button
                onClick={() => {
                  // Add inning
                  setInningsCount((prev) => prev + 1);
                  setCompletedInnings((prev) => [...prev, false]);
                  setCollapsedInnings((prev) => [...prev, false]);

                  setter((prev) => ({
                    ...prev,
                    book: prev.book.map((row) => [...row, makeEmptyCell()]),
                  }));
                }}
              >
                + Inning
              </button>
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {team.book.map((row, pIdx) => (
            <tr key={pIdx}>
              {/* Player Name */}
              <td style={{ border: "1px solid #aaa" }}>
                <input
                  value={team.lineup[pIdx]}
                  onChange={(e) => {
                    const v = e.target.value;
                    setter((prev) => ({
                      ...prev,
                      lineup: prev.lineup.map((n, i) => (i === pIdx ? v : n)),
                    }));
                  }}
                  style={{ width: "100%" }}
                />
              </td>

              {/* Position */}
              <td style={{ border: "1px solid #aaa" }}>
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
                  style={{ width: "100%" }}
                />
              </td>

              {/* Inning Cells */}
              {row.map((cell, iIdx) => {
                let totalOuts = 0;
                for (let p = 0; p <= pIdx; p++) {
                  const c = team.book[p][iIdx];
                  if (c?.outs) totalOuts += c.outs;
                }
                if (totalOuts > 3) totalOuts = 3;

                return (
                  <td
                    key={iIdx}
                    style={{
                      border: "1px solid #aaa",
                      width: collapsedInnings[iIdx] ? 40 : 160,
                      textAlign: "center",
                      padding: 4,
                    }}
                  >
                    {collapsedInnings[iIdx] ? (
                      <span style={{ opacity: 0.5 }}>…</span>
                    ) : (
                      <DiamondCell
                        cell={cell}
                        totalOuts={totalOuts}
                        inningOver={completedInnings[iIdx]}
                        globalToggle={globalToggle}
                        closePanels={closeAllPanels}
                        updateResult={(val) =>
                          setter((prev) => {
                            const book = prev.book.map((r2, ri) =>
                              r2.map((c2, ci) =>
                                ri === pIdx && ci === iIdx
                                  ? { ...c2, result: val }
                                  : c2
                              )
                            );
                            return { ...prev, book };
                          })
                        }
                        advanceRunner={() =>
                          setter((prev) => {
                            const book = prev.book.map((r2, ri) =>
                              r2.map((c2, ci) => {
                                if (ri !== pIdx || ci !== iIdx) return c2;
                                return {
                                  ...c2,
                                  bases: {
                                    b3: false,
                                    b2: c2.bases.b3,
                                    b1: c2.bases.b2,
                                  },
                                };
                              })
                            );
                            return { ...prev, book };
                          })
                        }
                        updateRun={() =>
                          setter((prev) => {
                            const book = prev.book.map((r2, ri) =>
                              r2.map((c2, ci) =>
                                ri === pIdx && ci === iIdx
                                  ? { ...c2, scored: true }
                                  : c2
                              )
                            );
                            return { ...prev, book };
                          })
                        }
                        clearCell={() =>
                          setter((prev) => {
                            const book = prev.book.map((r2, ri) =>
                              r2.map((c2, ci) =>
                                ri === pIdx && ci === iIdx
                                  ? makeEmptyCell()
                                  : c2
                              )
                            );
                            return { ...prev, book };
                          })
                        }
                        addOut={(type, count, display) =>
                          setter((prev) => {
                            const book = prev.book.map((r2, ri) =>
                              r2.map((c2, ci) =>
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
                        updateAdvances={(route) =>
                          setter((prev) => {
                            const book = prev.book.map((r2, ri) =>
                              r2.map((c2, ci) => {
                                if (ri !== pIdx || ci !== iIdx) return c2;
                                const prevAdv = c2.advances ?? [];
                                return { ...c2, advances: [...prevAdv, route] };
                              })
                            );
                            return { ...prev, book };
                          })
                        }
                      />
                    )}

                    {/* Complete inning button */}
                    {totalOuts >= 3 && !completedInnings[iIdx] && (
                      <button
                        style={{
                          marginTop: 4,
                          background: "#faa",
                          border: "1px solid #900",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          const updated = [...completedInnings];
                          updated[iIdx] = true;
                          setCompletedInnings(updated);
                        }}
                      >
                        Complete Inning?
                      </button>
                    )}
                  </td>
                );
              })}

              {/* Add Player Button Column */}
              {pIdx === 0 && (
                <td rowSpan={playersCount}>
                  <button
                    onClick={() => {
                      setPlayersCount((prev) => prev + 1);

                      setter((prev) => ({
                        ...prev,
                        lineup: [...prev.lineup, ""],
                        positions: [...prev.positions, ""],
                        book: [
                          ...prev.book,
                          Array(inningsCount)
                            .fill(0)
                            .map(() => makeEmptyCell()),
                        ],
                      }));
                    }}
                  >
                    + Player
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // -------------------------
  // RENDER BOTH TEAMS
  // -------------------------
  return (
    <div style={{ padding: 20 }}>
      <h1>Old School Baseball Scorekeeper</h1>

      <h2>Away</h2>
      <ScoreBug
        runs={awayStats.runs}
        hits={awayStats.hits}
        errors={awayStats.errors}
        teamName="AWAY"
      />
      {renderTeamGrid(
        away,
        setAway,
        awayInnings,
        awayCompletedInnings,
        setAwayCompletedInnings,
        awayPlayersCount,
        setAwayPlayersCount,
        awayCollapsedInnings,
        setAwayCollapsedInnings,
        setAwayInnings
      )}
      <hr></hr>
      <h2 style={{ marginTop: 40 }}>Home</h2>
      <ScoreBug
        runs={homeStats.runs}
        hits={homeStats.hits}
        errors={homeStats.errors}
        teamName="HOME"
      />
      {renderTeamGrid(
        home,
        setHome,
        homeInnings,
        homeCompletedInnings,
        setHomeCompletedInnings,
        homePlayersCount,
        setHomePlayersCount,
        homeCollapsedInnings,
        setHomeCollapsedInnings,
        setHomeInnings
      )}
    </div>
  );
};

export default Scorekeeper;
