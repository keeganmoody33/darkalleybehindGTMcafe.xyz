import type { SourceType } from "./database.types";

export interface NormalizedJob {
  externalId: string;
  externalUrl: string;
  title: string;
  descriptionRaw: string;
  descriptionPlain: string;
  companyName: string;
  location: string | null;
  isRemote: boolean;
  department: string | null;
  employmentType: string | null;
  postedAt: Date | null;
  sourceType: SourceType;
}

export interface LeverPosting {
  id: string;
  text: string;
  hostedUrl: string;
  createdAt: number;
  description: string;
  descriptionPlain?: string;
  lists?: { text: string; content: string }[];
  additional?: string;
  additionalPlain?: string;
  categories: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
    allLocations?: string[];
  };
  tags?: string[];
  content?: {
    description?: string;
    descriptionHtml?: string;
    lists?: { text: string; content: string }[];
    closing?: string;
    closingHtml?: string;
  };
  urls?: {
    list?: string;
    show?: string;
    apply?: string;
  };
}

export interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  updated_at: string;
  location: { name: string };
  content: string;
  departments: { id: number; name: string }[];
}

export interface AshbyJob {
  id: string;
  title: string;
  externalLink: string;
  location: string;
  employmentType: string;
  department: string;
  publishedAt: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
}

export interface ScanResult {
  jobsFound: number;
  jobsNew: number;
  jobsDuplicate: number;
  errors: string[];
}
