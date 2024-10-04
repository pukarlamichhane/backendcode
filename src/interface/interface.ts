export interface Todoresponse {
  id: number;
  task: string;
  description: string;
  severity: "Low" | "High" | "Medium" | "Critical";
  complete: boolean;
  createdat: Date;
  updatedat: Date;
  status: boolean;
}

enum Severity {
  High,
  Low,
  Medium,
  Critical,
}

export interface createParams {
  task: string;
  description: string;
  serverity: Severity;
}

export interface updateInput {}

export interface updateParams {
  num: String;
}

export interface deleteParams {
  num: String;
}
