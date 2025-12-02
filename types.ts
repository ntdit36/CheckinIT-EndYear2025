export enum TeamLabel {
  T1 = '1',
  T2 = '2',
  T3 = '3',
  T4 = '4',
  T5 = '5',
  T6 = '6',
  T7 = '7',
  T8 = '8',
  T9 = '9',
  T10 = '10',
  ADMIN = 'ADMIN'
}

export interface Guest {
  id: string;
  name: string;
  team: TeamLabel;
  raffleNumber: number;
  aiSlogan?: string;
  timestamp: number;
}

export interface AppState {
  guests: Guest[];
  availableNumbers: number[];
  teamCounts: Record<TeamLabel, number>;
}

// Loại bỏ ADMIN ra khỏi danh sách random chính
export const PLAYING_TEAMS = [
  TeamLabel.T1, TeamLabel.T2, TeamLabel.T3, TeamLabel.T4, TeamLabel.T5, TeamLabel.T6,
  TeamLabel.T7, TeamLabel.T8, TeamLabel.T9, TeamLabel.T10
];

export const ALL_TEAMS = [...PLAYING_TEAMS, TeamLabel.ADMIN];

// Cấu hình giới hạn từng đội:
// Team 1-6: 4 người
// Team 7-10: 5 người
// Admin: 3 người
export const TEAM_CAPACITIES: Record<TeamLabel, number> = {
  [TeamLabel.T1]: 4,
  [TeamLabel.T2]: 4,
  [TeamLabel.T3]: 4,
  [TeamLabel.T4]: 4,
  [TeamLabel.T5]: 4,
  [TeamLabel.T6]: 4,
  [TeamLabel.T7]: 5,
  [TeamLabel.T8]: 5,
  [TeamLabel.T9]: 5,
  [TeamLabel.T10]: 5,
  [TeamLabel.ADMIN]: 3
};

export const TOTAL_CAPACITY = 47;