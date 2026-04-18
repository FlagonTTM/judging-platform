export type UserRole = 'admin' | 'judge' | 'team';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Event {
  id: string;
  name: string;
  start_at: string;
  end_at: string;
  deadline: string | null;
  results_published: boolean;
  leaderboard_public: boolean;
  judge_comments_visible: boolean;
}

export interface Criterion {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  weight: number;
  max_score: number;
}

export interface Team {
  id: string;
  event_id: string;
  name: string;
  track: string | null;
  members: Array<Record<string, unknown>>;
  contacts: Record<string, unknown>;
}

export interface Score {
  id: string;
  team_id: string;
  criterion_id: string;
  judge_id: string;
  value: string;
  comment: string | null;
  status: 'draft' | 'submitted';
  submitted_at: string | null;
}

export interface LeaderboardRow {
  team_id: string;
  team_name: string;
  final_score: string;
  judges_count: number;
}

export type StageStatus = 'pending' | 'in_progress' | 'done';

export interface Stage {
  id: string;
  event_id: string;
  name: string;
  order: number;
}

export interface TeamProgressItem {
  stage_id: string;
  stage_name: string;
  order: number;
  status: StageStatus;
  updated_at: string | null;
}

export interface TeamProgress {
  team_id: string;
  items: TeamProgressItem[];
}

export interface EventProgressRow {
  team_id: string;
  team_name: string;
  items: TeamProgressItem[];
}

export interface TeamResultOut {
  team_id: string;
  team_name: string;
  rank: number;
  final_score: string;
  judges_count: number;
}
