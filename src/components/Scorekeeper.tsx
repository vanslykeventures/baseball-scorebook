import React, { useState } from "react";
import DiamondCell from "./DiamondCell/DiamondCell"; // assuming you moved it to its own file
import type { ScoreCell, TeamScorebook } from "../../types"; // your types

const makeEmptyBook = (players: number, innings: number): ScoreCell[][] =>
  Array.from({ length: players }, () =>
    Array.from({ length: innings }, () => ({
      result: "",
      bases: { b1: false, b2: false, b3: false },
      scored: false,
      fieldingType: "",
      outs: 0,
      fieldingDisplay: "",
    }))
  );

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

  const updateLineup = (setter: React.Dispatch<React.SetStateAction<TeamScorebook>>, idx: number, val: string) => {
    setter(prev => {
      const updated = [...prev.lineup];
      updated[idx] = val;
      return { ...prev, lineup: updated };
    });
  };

  const updatePosition = (setter: React.Dispatch<React.SetStateAction<TeamScorebook>>, idx: number, val: string) => {
    setter(prev => {
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
    setter(prev => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) => (ri === pIdx && ci === iIdx ? { ...cell, result: val } : cell))
      );
      return { ...prev, book };
    });
  };

  const advanceRunner = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    pIdx: number,
    iIdx: number
  ) => {
    setter(prev => {
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
    setter(prev => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) => (ri === pIdx && ci === iIdx ? { ...cell, scored: value } : cell))
      );
      return { ...prev, book };
    });
  };

  const clearCell = (
    setter: React.Dispatch<React.SetStateAction<TeamScorebook>>,
    pIdx: number,
    iIdx: number
  ) => {
    setter(prev => {
      const book = prev.book.map((row, ri) =>
        row.map((cell, ci) => (ri === pIdx && ci === iIdx ? { result: "", bases: { b1: false, b2: false, b3: false }, scored: false, fieldingType: "", outs: 0, fieldingDisplay: "" } : cell))
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
                onChange={e => updateLineup(setter, pIdx, e.target.value)}
              />
            </td>
            <td style={{ border: "1px solid #aaa", padding: 4 }}>
              <input
                value={team.positions[pIdx]}
                placeholder="1,2,3,SS"
                onChange={e => updatePosition(setter, pIdx, e.target.value)}
                style={{ width: 30 }}
              />
            </td>
            {row.map((cell, iIdx) => (
              <td key={iIdx} style={{ border: "1px solid #aaa", padding: 4 }}>
                <DiamondCell
                  cell={cell}
                  updateResult={val => updateResult(setter, pIdx, iIdx, val)}
                  advanceRunner={() => advanceRunner(setter, pIdx, iIdx)}
                  updateRun={value => updateRun(setter, pIdx, iIdx, value)}
                  clearCell={() => clearCell(setter, pIdx, iIdx)}
                  addOut={(type, count, display) => {
                    setter(prev => {
                      const book = prev.book.map((row, ri) =>
                        row.map((c, ci) =>
                          ri === pIdx && ci === iIdx
                            ? { ...c, outs: count, fieldingType: type, fieldingDisplay: display }
                            : c
                        )
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
