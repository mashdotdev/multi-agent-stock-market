export type Ticker = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  asOf: string;
};

export type Candle = {
  i: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type AgentState = "idle" | "thinking" | "done" | "error" | "streaming";

export type Agent = {
  id: string;
  name: string;
  role: string;
  initial: string;
  state: AgentState;
  task: string;
  progress: number;
  color: string;
};

export type Message = {
  role: "user" | "assistant";
  agent?: string;
  text?: string;
  displayText: string;
  streaming: boolean;
  done: boolean;
  time?: string;
  chunks?: string[];
};
