import React, { useEffect, useRef, useState } from "react";
import DiamondCell from "./DiamondCell/DiamondCell";
import { makeEmptyCell, makeEmptyBook, type BaseState, type TeamScorebook } from "../../types";
import ScoreBug from "./ScoreBug/ScoreBug";

const Scorekeeper: React.FC = () => {
  const defaultInnings = 3;
  const defaultPlayers = 9;
  const seedArray = (values: string[], count: number) =>
    Array.from({ length: count }, (_, i) => values[i] ?? "");
  const makeEmptyBases = (): BaseState => ({ b1: false, b2: false, b3: false });
  type RunnerBases = { b1: number | null; b2: number | null; b3: number | null };
  const makeEmptyRunnerBases = (): RunnerBases => ({
    b1: null,
    b2: null,
    b3: null,
  });
  const makeRunnerBasesByInning = (count: number) =>
    Array.from({ length: count }, () => makeEmptyRunnerBases());

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
  const [awayBasesByInning, setAwayBasesByInning] = useState<RunnerBases[]>(
    makeRunnerBasesByInning(defaultInnings)
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
  const [homeBasesByInning, setHomeBasesByInning] = useState<RunnerBases[]>(
    makeRunnerBasesByInning(defaultInnings)
  );

  // -------------------------
  // CLOSE OTHER CELLS' PANELS
  // -------------------------
  const [globalToggle, setGlobalToggle] = useState(0);
  const closeAllPanels = () => setGlobalToggle((n) => n + 1);
  const [activeTeam, setActiveTeam] = useState<"away" | "home">("away");
  const [selectedPlayer, setSelectedPlayer] = useState<{
    name: string;
    position: string;
    team: "AWAY" | "HOME";
    index: number;
  } | null>(null);
  const [statsTab, setStatsTab] = useState<"game" | "season">("game");
  const [awayNextBatter, setAwayNextBatter] = useState(0);
  const [homeNextBatter, setHomeNextBatter] = useState(0);
  const [awayNextInning, setAwayNextInning] = useState(0);
  const [homeNextInning, setHomeNextInning] = useState(0);
  const awayRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const homeRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    const isAwayActive = activeTeam === "away";
    const refs = isAwayActive ? awayRowRefs.current : homeRowRefs.current;
    const targetIndex = isAwayActive ? awayNextBatter : homeNextBatter;
    const row = refs[targetIndex];
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeTeam, awayNextBatter, homeNextBatter]);

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

  const openPlayerStats = (
    team: "AWAY" | "HOME",
    name: string,
    position: string,
    index: number
  ) => {
    setSelectedPlayer({ name, position, team, index });
    setStatsTab("game");
  };

  const updateBasesByInning = (
    setter: React.Dispatch<React.SetStateAction<RunnerBases[]>>,
    inningIndex: number,
    nextBases: RunnerBases
  ) => {
    setter((prev) => {
      if (inningIndex >= prev.length) {
        return [...prev, nextBases];
      }
      return prev.map((bases, idx) => (idx === inningIndex ? nextBases : bases));
    });
  };

  const applyBattingResult = (
    teamName: "AWAY" | "HOME",
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    playerIndex: number,
    inningIndex: number,
    result: string
  ) => {
    const basesByInning =
      teamName === "AWAY" ? awayBasesByInning : homeBasesByInning;
    const basesBefore = basesByInning[inningIndex] ?? makeEmptyRunnerBases();
    let basesAfter = { ...basesBefore };
    let batterBases = makeEmptyBases();
    let batterScored = false;
    const runnerAdvances = new Map<number, string[]>();
    const runnerScored = new Set<number>();

    const addAdvance = (runnerIndex: number | null, route: string) => {
      if (runnerIndex === null || runnerIndex === undefined) return;
      const existing = runnerAdvances.get(runnerIndex) ?? [];
      runnerAdvances.set(runnerIndex, [...existing, route]);
    };

    const addScore = (runnerIndex: number | null, route: string) => {
      if (runnerIndex === null || runnerIndex === undefined) return;
      addAdvance(runnerIndex, route);
      runnerScored.add(runnerIndex);
    };

    if (["BB", "1B"].includes(result)) {
      addScore(basesBefore.b3, "3-H");
      addAdvance(basesBefore.b2, "2-3");
      addAdvance(basesBefore.b1, "1-2");
      basesAfter = {
        b1: playerIndex,
        b2: basesBefore.b1,
        b3: basesBefore.b2,
      };
      batterBases = { b1: true, b2: false, b3: false };
    } else if (result === "2B") {
      addScore(basesBefore.b3, "3-H");
      addScore(basesBefore.b2, "2-H");
      addAdvance(basesBefore.b1, "1-3");
      basesAfter = {
        b1: null,
        b2: playerIndex,
        b3: basesBefore.b1,
      };
      batterBases = { b1: false, b2: true, b3: false };
    } else if (result === "3B") {
      addScore(basesBefore.b3, "3-H");
      addScore(basesBefore.b2, "2-H");
      addScore(basesBefore.b1, "1-H");
      basesAfter = { b1: null, b2: null, b3: playerIndex };
      batterBases = { b1: false, b2: false, b3: true };
    } else if (result === "HR") {
      addScore(basesBefore.b3, "3-H");
      addScore(basesBefore.b2, "2-H");
      addScore(basesBefore.b1, "1-H");
      basesAfter = makeEmptyRunnerBases();
      batterBases = makeEmptyBases();
      batterScored = true;
    } else {
      basesAfter = { ...basesBefore };
      batterBases = makeEmptyBases();
    }

    setter((prev) => {
      const pendingRunnerAdvances = runnerAdvances;
      const pendingRunnerScores = runnerScored;
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) => {
          if (ci !== inningIndex) return cell;
          if (ri === playerIndex) {
            return {
              ...cell,
              result,
              bases: batterBases,
              scored: batterScored,
            };
          }
          const advances = pendingRunnerAdvances.get(ri);
          const scored = pendingRunnerScores.has(ri);
          if (!advances && !scored) return cell;
          const prevAdvances = cell.advances ?? [];
          return {
            ...cell,
            advances: advances ? [...prevAdvances, ...advances] : prevAdvances,
            scored: scored ? true : cell.scored,
          };
        })
      );
      return { ...prev, book };
    });

    if (teamName === "AWAY") {
      updateBasesByInning(setAwayBasesByInning, inningIndex, basesAfter);
    } else {
      updateBasesByInning(setHomeBasesByInning, inningIndex, basesAfter);
    }
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

  const formatAverage = (hits: number, atBats: number) => {
    if (atBats === 0) return "--";
    const avg = (hits / atBats).toFixed(3);
    return avg.startsWith("0") ? avg.slice(1) : avg;
  };

  const computeGameStats = (
    team: TeamScorebook,
    completedInnings: boolean[],
    playerIndex: number
  ) => {
    let hits = 0;
    let homeRuns = 0;
    let walks = 0;
    let strikeouts = 0;
    let runsBattedIn = 0;
    let runs = 0;
    let atBats = 0;

    completedInnings.forEach((isComplete, inningIndex) => {
      if (!isComplete) return;
      const cell = team.book[playerIndex]?.[inningIndex];
      if (!cell) return;

      const result = cell.result;
      const hasOut = (cell.outs ?? 0) > 0 || Boolean(cell.fieldingDisplay);
      if (!result && !hasOut) return;

      const isHit = ["1B", "2B", "3B", "HR"].includes(result);
      if (isHit) hits += 1;
      if (result === "HR") homeRuns += 1;
      if (result === "BB") walks += 1;
      if (["K", "ꓘ"].includes(result)) strikeouts += 1;

      if (result !== "BB") atBats += 1;
      if (cell.scored) {
        runsBattedIn += 1;
        runs += 1;
      }
    });

    return {
      avg: formatAverage(hits, atBats),
      hr: homeRuns,
      rbi: runsBattedIn,
      r: runs,
      h: hits,
      bb: walks,
      so: strikeouts,
    };
  };

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
    const isActiveTeam =
      (team.name === "AWAY" && activeTeam === "away") ||
      (team.name === "HOME" && activeTeam === "home");
    const focusPlayerIndex =
      team.name === "AWAY" ? awayNextBatter : homeNextBatter;
    const focusInningIndex =
      team.name === "AWAY" ? awayNextInning : homeNextInning;
    const safeFocusInningIndex = Math.min(
      focusInningIndex,
      inningsCount - 1
    );
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
          {team.book.map((row, pIdx) => {
            const isFocusedRow = isActiveTeam && pIdx === focusPlayerIndex;
            return (
            <tr
              key={pIdx}
              ref={(el) => {
                if (team.name === "AWAY") {
                  awayRowRefs.current[pIdx] = el;
                } else {
                  homeRowRefs.current[pIdx] = el;
                }
              }}
            >
              {/* Player Name */}
              <td
                style={{
                  border: "none",
                  background: isFocusedRow
                    ? "var(--panel-2)"
                    : "var(--cell-bg)",
                  borderRight: "1px solid var(--border)",
                  borderTop: pIdx === 0 ? "1px solid var(--border)" : "none",
                  borderBottom: "1px solid var(--border)",
                  padding: "8px 6px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "6px 8px",
                  }}
                >
                  <span>{team.lineup[pIdx]}</span>
                  <button
                    onClick={() =>
                      openPlayerStats(
                        team.name as "AWAY" | "HOME",
                        team.lineup[pIdx],
                        team.positions[pIdx],
                        pIdx
                      )
                    }
                    aria-label={`Open stats for ${team.lineup[pIdx]}`}
                    style={{
                      padding: "2px 6px",
                      fontSize: 14,
                      lineHeight: 1,
                      background: "var(--panel-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                    }}
                  >
                    📊
                  </button>
                </div>
              </td>

              {/* Position */}
              <td
                style={{
                  border: "none",
                  borderRight: "1px solid var(--border)",
                  background: isFocusedRow
                    ? "var(--panel-2)"
                    : "var(--cell-bg)",
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
                      boxShadow:
                        isFocusedRow && iIdx === safeFocusInningIndex
                          ? "0 0 0 2px var(--accent) inset"
                          : "none",
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
                          applyBattingResult(
                            team.name as "AWAY" | "HOME",
                            setter,
                            pIdx,
                            iIdx,
                            val
                          )
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
                          const nextBatter =
                            (pIdx + 1) % Math.max(team.book.length, 1);
                          const nextInning = iIdx + 1;
                          if (team.name === "AWAY") {
                            setAwayNextBatter(nextBatter);
                            setAwayNextInning(nextInning);
                            setActiveTeam("home");
                          } else {
                            setHomeNextBatter(nextBatter);
                            setHomeNextInning(nextInning);
                            setActiveTeam("away");
                          }
                        }}
                      >
                        Complete Inning?
                      </button>
                    )}
                  </td>
                );
              })}

            </tr>
          );
          })}
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
                onClick={() => {
                  addInning(
                    setAway,
                    setAwayInnings,
                    setAwayCompletedInnings,
                    setAwayCollapsedInnings
                  );
                  setAwayBasesByInning((prev) => [
                    ...prev,
                    makeEmptyRunnerBases(),
                  ]);
                }}
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
                onClick={() => {
                  addInning(
                    setHome,
                    setHomeInnings,
                    setHomeCompletedInnings,
                    setHomeCollapsedInnings
                  );
                  setHomeBasesByInning((prev) => [
                    ...prev,
                    makeEmptyRunnerBases(),
                  ]);
                }}
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

      {selectedPlayer && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(9, 12, 16, 0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            style={{
              width: "min(720px, 100%)",
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 16,
              color: "var(--text)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {selectedPlayer.name}
                </div>
                <div style={{ color: "var(--muted)" }}>
                  {selectedPlayer.team} • {selectedPlayer.position}
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                style={{ borderRadius: 999, padding: "8px 14px" }}
              >
                Close
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button
                onClick={() => setStatsTab("game")}
                style={{
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontWeight: 600,
                  background:
                    statsTab === "game" ? "var(--panel-3)" : "var(--panel)",
                }}
              >
                Game Stats
              </button>
              <button
                onClick={() => setStatsTab("season")}
                style={{
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontWeight: 600,
                  background:
                    statsTab === "season" ? "var(--panel-3)" : "var(--panel)",
                }}
              >
                Season Stats
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 12,
              }}
            >
              {(() => {
                const teamData =
                  selectedPlayer.team === "AWAY" ? away : home;
                const completed =
                  selectedPlayer.team === "AWAY"
                    ? awayCompletedInnings
                    : homeCompletedInnings;
                const stats = computeGameStats(
                  teamData,
                  completed,
                  selectedPlayer.index
                );

                // TODO: Season stats will be generated from the real data source.
                return (
                  <>
                    <div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>
                        AVG
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {statsTab === "game" ? stats.avg : ".281"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>
                        HR
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {statsTab === "game" ? stats.hr : "18"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>
                        RBI
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {statsTab === "game" ? stats.rbi : "64"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>
                        R
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {statsTab === "game" ? stats.r : "82"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>
                        H
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {statsTab === "game" ? stats.h : "97"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>
                        BB
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {statsTab === "game" ? stats.bb : "42"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>
                        SO
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {statsTab === "game" ? stats.so : "88"}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scorekeeper;
