export type BaseState = {
  b1: boolean;
  b2: boolean;
  b3: boolean;
};

export type ScoreCell = {
  result: string;
  bases: BaseState;
  scored: boolean;

  // fielding
  fieldingType?: string;
  outs?: number;
  fieldingDisplay?: string;
};

// One row per player, one column per inning
export type PlayerRow = ScoreCell[];

export type TeamScorebook = {
  name: string;
  lineup: string[];
  positions: string[];
  book: PlayerRow[];
};

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------
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