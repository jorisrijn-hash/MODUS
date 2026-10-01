export type DiagnosticAnswers = {
  companyName: string;
  website: string;
  industry: string;
  industryOther: string;
  employees: string;
  locations: string;

  reachChannels: string[];
  enquiryHandling: string[];
  adminHours: string;
  processStandardization: number; // 1-5
  dependency: "Low" | "Medium" | "High" | "";

  systems: string[];
  specificTools: string;
  connectionLevel: string;
  spreadsheetDependency: string;
  automationUsage: string[];

  friction: string[];
  primaryPain: string;
  problemDescription: string;
  frequency: string;
  impact: string[];

  primaryInterest: string;
  priorities: string[];
  timing: string;
  decisionContext: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  roleOther: string;
};

export const emptyAnswers: DiagnosticAnswers = {
  companyName: "",
  website: "",
  industry: "",
  industryOther: "",
  employees: "",
  locations: "",

  reachChannels: [],
  enquiryHandling: [],
  adminHours: "",
  processStandardization: 3,
  dependency: "",

  systems: [],
  specificTools: "",
  connectionLevel: "",
  spreadsheetDependency: "",
  automationUsage: [],

  friction: [],
  primaryPain: "",
  problemDescription: "",
  frequency: "",
  impact: [],

  primaryInterest: "",
  priorities: [],
  timing: "",
  decisionContext: "",

  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  roleOther: "",
};

export type Signal = {
  id: string;
  headline: string;
  body: string;
  why: string;
  inspect: string[];
  intervention: string;
};

export type ProfileIndicator = {
  label: string;
  value: string;
  tone: "low" | "moderate" | "high" | "early";
};
