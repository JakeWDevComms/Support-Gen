export type SupportBenefit = {
  id: string;
  label: string;
  phrasings: [string,string,string,...string[]];
};

export type ReachCampaign = {
  slug: string;
  name: string;
  channel: string;
  journey?: "direct" | "landing";
  headline?: string;
  intro?: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
};

export type ReachConfig = {
  eyebrow?: string;
  headline: string;
  intro: string;
  supportCta?: string;
  learnMoreCta?: string;
  learnMoreUrl?: string;
  keyPoints?: string[];
  campaigns: ReachCampaign[];
};

export type ProjectConfig = {
  id: string;
  slug: string;
  clientName: string;
  dataController: string;
  dataProcessor: string;
  schemeName: string;
  location?: string;
  pitch: string;
  applicationReference: string;
  planningAuthority: { name: string; to: string[]; cc?: string[] };
  theme: { primary: string; primaryDark: string; accent: string; background: string; logoUrl?: string };
  benefits: SupportBenefit[];
  letter: { salutations: string[]; openings: string[]; transitions?: string[]; closings: string[]; subject: string; transparencyLine?: string };
  campaign?: {
    projectType?: "residential" | "employment" | "renewables" | "infrastructure" | "mixed" | "other";
    destinationUrl?: string;
    targetArea?: string;
    audienceNotes?: string;
  };
  reach?: ReachConfig;
  consultationCloses?: string;
  retentionMonths: number;
  privacy: { coreLawfulBasis: string; legitimateInterest?: string; contactEmail?: string; controllerPrivacyUrl?: string };
  keepUpdatedLabel?: string;
  embedOrigins?: string[];
};
