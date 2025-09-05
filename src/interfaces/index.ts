export enum StakingPeriod {
  Minutes1 = "minutes1",
  Minutes2 = "minutes2",
  Minutes5 = "minutes5",
  Minutes10 = "minutes10",
}

export interface ILeaderboard {
  id: number;
  avatar: string;
  username: string;
  rank: number;
  winnings: number;
  last_win: number;
}
