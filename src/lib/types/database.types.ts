export type CompanyStage =
  | "seed"
  | "series-a"
  | "series-b"
  | "growth"
  | "public"
  | "unknown";

export type EmployeeCountRange =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "500+";

export type SourceType = "lever" | "greenhouse" | "ashby" | "manual";

export type ScanStatus = "pending" | "running" | "completed" | "failed";

export type JobStatus =
  | "new"
  | "reviewed"
  | "shortlisted"
  | "applied"
  | "outreach_sent"
  | "interviewing"
  | "archived";

export type EmploymentType = "full-time" | "contract" | "part-time";

export interface Company {
  id: string;
  name: string;
  domain: string | null;
  inferred_stage: CompanyStage | null;
  employee_count_range: EmployeeCountRange | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  config: Record<string, unknown>;
  is_active: boolean;
  scan_frequency_minutes: number;
  last_scanned_at: string | null;
  created_at: string;
}

export interface Scan {
  id: string;
  source_id: string;
  status: ScanStatus;
  started_at: string | null;
  completed_at: string | null;
  jobs_found: number;
  jobs_new: number;
  jobs_duplicate: number;
  error_message: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  source_id: string;
  external_id: string | null;
  external_url: string;
  title: string;
  description_raw: string | null;
  description_plain: string | null;
  location: string | null;
  is_remote: boolean;
  department: string | null;
  employment_type: EmploymentType | null;
  posted_at: string | null;
  discovered_at: string;
  status: JobStatus;
  outreach_angle: string | null;
  dedupe_key: string;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  job_id: string;
  founding_score: number;
  builder_score: number;
  gtm_fit_score: number;
  noise_penalty: number;
  prestige_trap_penalty: number;
  overall_score: number;
  explanation: ScoreExplanation;
  scored_at: string;
}

export interface Note {
  id: string;
  job_id: string;
  content: string;
  created_at: string;
}

export interface StatusHistoryEntry {
  id: string;
  job_id: string;
  from_status: JobStatus;
  to_status: JobStatus;
  changed_at: string;
}

export interface ScoreSignal {
  text: string;
  impact: string;
}

export interface DimensionExplanation {
  score: number;
  signals: ScoreSignal[];
  summary: string;
}

export interface ScoreExplanation {
  founding: DimensionExplanation;
  builder: DimensionExplanation;
  gtm_fit: DimensionExplanation;
  noise: DimensionExplanation;
  prestige_trap: DimensionExplanation;
  overall: {
    score: number;
    summary: string;
  };
}

export interface JobWithScore extends Job {
  score: Score | null;
  company: Company | null;
}
