export type BaseState = {
  b1: boolean;
  b2: boolean;
  b3: boolean;
};

export type ScoreCell = {
  result: string;
  bases: BaseState;
  scored: boolean;
  fieldingType?: string;
  outs?: number;
  fieldingDisplay?: string;
};

export type PlayerRow = ScoreCell[];

export type TeamScorebook = {
  name: string;
  lineup: string[];
  positions: string[];
  book: PlayerRow[];
};
