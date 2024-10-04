export interface UpdateTodoInput {
  id: String;
  task: String;
  description: String;
  severity: "Low" | "High" | "Medium" | "Critical";
  complete: Boolean;
}

export interface CreateTodoInput {
  task: String;
  description: String;
  severity: "Low" | "High" | "Medium" | "Critical";
}

export interface getDate {
  startDate: String;
  endDate: String;
}

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
