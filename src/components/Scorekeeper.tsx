import React, { useState } from "react";
import DiamondCell from "./DiamondCell/DiamondCell";
import { makeEmptyCell, makeEmptyBook, type TeamScorebook } from "../../types";
import ScoreBug from "./ScoreBug/ScoreBug";

const Scorekeeper: React.FC = () => {
  const defaultInnings = 3;
  const defaultPlayers = 9;
  const seedArray = (values: string[], count: number) =>
    Array.from({ length: count }, (_, i) => values[i] ?? "");

  // hardcoded for visual clarity for now.  Will come from team info eventually.
  const awaySeed = {
    lineup: [
      "A. Carter",
      "M. Rivera",
      "J. Brooks",
      "T. Alvarez",
      "R. Fields",
      "D. Young",
      "S. Monroe",
      "L. Kim",
      "C. Patel",
    ],
    positions: ["CF", "SS", "1B", "3B", "RF", "2B", "LF", "C", "P"],
  };
  const homeSeed = {
    lineup: [
      "K. Johnson",
      "P. Morales",
      "E. Nguyen",
      "B. Thompson",
      "N. Clark",
      "I. Dawson",
      "V. Ortiz",
      "G. Foster",
      "H. Reed",
    ],
    positions: ["CF", "2B", "SS", "1B", "RF", "3B", "LF", "C", "P"],
  };

  // -------------------------
  // AWAY TEAM STATE
  // -------------------------
  const [away, setAway] = useState<TeamScorebook>({
    name: "AWAY",
    lineup: seedArray(awaySeed.lineup, defaultPlayers),
    positions: seedArray(awaySeed.positions, defaultPlayers),
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
    lineup: seedArray(homeSeed.lineup, defaultPlayers),
    positions: seedArray(homeSeed.positions, defaultPlayers),
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
  const [activeTeam, setActiveTeam] = useState<"away" | "home">("away");

  const addInning = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    setInningsCount: React.Dispatch<React.SetStateAction<number>>,
    setCompletedInnings: React.Dispatch<React.SetStateAction<boolean[]>>,
    setCollapsedInnings: React.Dispatch<React.SetStateAction<boolean[]>>
  ) => {
    setInningsCount((prev) => prev + 1);
    setCompletedInnings((prev) => [...prev, false]);
    setCollapsedInnings((prev) => [...prev, false]);

    setter((prev) => ({
      ...prev,
      book: prev.book.map((row) => [...row, makeEmptyCell()]),
    }));
  };

  const addPlayer = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    setPlayersCount: React.Dispatch<React.SetStateAction<number>>,
    inningsCount: number
  ) => {
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
  };

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
    collapsedInnings: boolean[],
    setCollapsedInnings: React.Dispatch<React.SetStateAction<boolean[]>>,
    setInningsCount: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        {/* HEADER */}
        <thead>
          <tr>
            <th
              style={{
                width: 90,
                background: "var(--table-header-bg)",
                border: "none",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                borderRight: "1px solid var(--border)",
                color: "var(--text)",
                textAlign: "center",
              }}
            >
              Player
            </th>
            <th
              style={{
                width: 34,
                background: "var(--table-header-bg)",
                border: "none",
                borderTop: "1px solid var(--border)",
                borderRight: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                color: "var(--text)",
                textAlign: "center",
              }}
            >
              Pos
            </th>

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
                  background: collapsedInnings[i]
                    ? "var(--table-header-bg-active)"
                    : "var(--table-header-bg)",
                  userSelect: "none",
                  padding: "4px 8px",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              >
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {team.book.map((row, pIdx) => (
            <tr key={pIdx}>
              {/* Player Name */}
              <td
                style={{
                  border: "none",
                  background: "var(--cell-bg)",
                  borderRight: "1px solid var(--border)",
                  borderTop: pIdx === 0 ? "1px solid var(--border)" : "none",
                  borderBottom: "1px solid var(--border)",
                  padding: "8px 6px",
                  textAlign: "center",
                }}
              >
                <div style={{ padding: "6px 8px", color: "var(--text)" }}>
                  {team.lineup[pIdx]}
                </div>
              </td>

              {/* Position */}
              <td
                style={{
                  border: "none",
                  borderRight: "1px solid var(--border)",
                  background: "var(--cell-bg)",
                  borderTop: pIdx === 0 ? "1px solid var(--border)" : "none",
                  borderBottom: "1px solid var(--border)",
                  padding: "8px 6px",
                  textAlign: "center",
                }}
              >
                <div style={{ padding: "6px 8px", color: "var(--text)" }}>
                  {team.positions[pIdx]}
                </div>
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
                      border: "1px solid var(--border)",
                      width: collapsedInnings[iIdx] ? 40 : 160,
                      textAlign: "center",
                      padding: 4,
                      background: "var(--cell-bg)",
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
                          background: "var(--danger)",
                          border: "1px solid var(--border-strong)",
                          color: "#0f1115",
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

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setActiveTeam("away")}
          aria-pressed={activeTeam === "away"}
          style={{
            background:
              activeTeam === "away" ? "var(--panel-3)" : "var(--panel)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontWeight: 600,
          }}
        >
          Away
        </button>
        <button
          onClick={() => setActiveTeam("home")}
          aria-pressed={activeTeam === "home"}
          style={{
            background:
              activeTeam === "home" ? "var(--panel-3)" : "var(--panel)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontWeight: 600,
          }}
        >
          Home
        </button>
      </div>

      {activeTeam === "away" && (
        <div
          style={{
            border: "1px solid var(--border)",
            background: "var(--panel)",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <ScoreBug
              runs={awayStats.runs}
              hits={awayStats.hits}
              errors={awayStats.errors}
              teamName="AWAY"
            />
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flex: 1,
              }}
            >
              <button
                onClick={() =>
                  addInning(
                    setAway,
                    setAwayInnings,
                    setAwayCompletedInnings,
                    setAwayCollapsedInnings
                  )
                }
                style={{
                  borderRadius: 999,
                  padding: "10px 18px",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                + Inning
              </button>
              <button
                onClick={() =>
                  addPlayer(setAway, setAwayPlayersCount, awayInnings)
                }
                style={{
                  borderRadius: 999,
                  padding: "10px 18px",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                + Player
              </button>
            </div>
          </div>
          {renderTeamGrid(
            away,
            setAway,
            awayInnings,
            awayCompletedInnings,
            setAwayCompletedInnings,
            awayCollapsedInnings,
            setAwayCollapsedInnings,
            setAwayInnings
          )}
        </div>
      )}

      {activeTeam === "home" && (
        <div
          style={{
            border: "1px solid var(--border)",
            background: "var(--panel)",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <ScoreBug
              runs={homeStats.runs}
              hits={homeStats.hits}
              errors={homeStats.errors}
              teamName="HOME"
            />
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flex: 1,
              }}
            >
              <button
                onClick={() =>
                  addInning(
                    setHome,
                    setHomeInnings,
                    setHomeCompletedInnings,
                    setHomeCollapsedInnings
                  )
                }
                style={{
                  borderRadius: 999,
                  padding: "10px 18px",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                + Inning
              </button>
              <button
                onClick={() =>
                  addPlayer(setHome, setHomePlayersCount, homeInnings)
                }
                style={{
                  borderRadius: 999,
                  padding: "10px 18px",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                + Player
              </button>
            </div>
          </div>
          {renderTeamGrid(
            home,
            setHome,
            homeInnings,
            homeCompletedInnings,
            setHomeCompletedInnings,
            homeCollapsedInnings,
            setHomeCollapsedInnings,
            setHomeInnings
          )}
        </div>
      )}
    </div>
  );
};

export default Scorekeeper;
