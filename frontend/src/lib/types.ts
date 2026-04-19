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
  value: number;
  comment: string | null;
  status: 'draft' | 'submitted';
  submitted_at: string | null;
}

export interface LeaderboardRow {
  team_id: string;
  team_name: string;
  final_score: number;
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
  final_score: number;
  judges_count: number;
}

export interface Submission {
  description: string | null;
  repo_url: string | null;
  demo_url: string | null;
  video_url: string | null;
  screenshot_url: string | null;
}

export type CheckStatus = 'ok' | 'missing' | 'weak' | 'broken';

export interface CheckItem {
  key: string;
  label: string;
  status: CheckStatus;
  message: string;
}

export interface CheckResult {
  overall: 'ready' | 'weak' | 'not_ready';
  items: CheckItem[];
}

export type CoverageLevel = 'strong' | 'partial' | 'missing';

export interface PreviewCoverage {
  criterion_id: string;
  criterion_name: string;
  coverage: CoverageLevel;
  note: string;
}

export interface PreviewResult {
  one_liner: string;
  features: string[];
  coverage: PreviewCoverage[];
  weak_spots: string[];
  likely_questions: string[];
}
