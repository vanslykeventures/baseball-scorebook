import type { ScoreCell, PlayerRow } from "./types";

export const makeEmptyCell = (): ScoreCell => ({
  result: "",
  bases: { b1: false, b2: false, b3: false },
  scored: false,
  fieldingType: "",
  outs: 0,
  fieldingDisplay: "",
});

export const makeEmptyBook = (players: number, innings: number): PlayerRow[] =>
  Array.from({ length: players }, () =>
    Array.from({ length: innings }, () => makeEmptyCell())
  );
