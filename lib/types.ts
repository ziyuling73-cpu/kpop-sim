export type PhonePost = {
  user: string;
  text: string;
  meta?: string;
};

export type ChatMsg = {
  from: "ta" | "me" | "system";
  text: string;
  status?: string;
};

export type PhoneState = {
  bubble: ChatMsg[];
  kakao: ChatMsg[];
  weverse: PhonePost[];
  x: PhonePost[];
  ins: PhonePost[];
  hot: PhonePost[];
};

export type GameConfig = {
  playerName: string;
  age: string;
  nationality: string;
  role: string;
  idolName: string;
  idolType: string;
  myNick: string;
  theirNick: string;
  publicImage: string;
  intensity: string;
  extra: string;
};

export type GameState = {
  round: number;
  time: string;
  chapterTitle: string;
  story: string;
  choices: string[];
  memory: string[];
  phone: PhoneState;
  config: GameConfig;
  lastAction?: string;
};
