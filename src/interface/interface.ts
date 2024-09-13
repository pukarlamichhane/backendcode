export interface UpdateTodoInput {
  id: String;
  task: String;
  description: String;
  severity: String;
  complete: Boolean;
}

export interface CreateTodoInput {
  task: String;
  description: String;
  severity: String;
}

export interface getDate {
  startDate: String;
  endDate: String;
}
