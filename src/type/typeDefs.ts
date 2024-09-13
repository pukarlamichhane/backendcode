export const typeDefs = `#graphql
  scalar Date

  type Book {
    id: ID
    title: String
    author: String
  }

  type Todo {
    id: ID!
    task: String!
    description: String!
    complete: Boolean!
    severity: String!
    createdat: Date!
    updatedat: Date!
    status: Boolean!
  }

  input CreateTodoInput {
    task: String!
    description: String!
    severity: String!
  }

  input UpdateTodoInput {
    id: ID!
    task: String!
    description: String!
    severity: String!
    complete: Boolean!
  }

  input DateInput {
    startDate: String!
    endDate: String!
  }

  type Return {
    key: String!
    doc_count: Int! 
  }

  type Query {
    greet: String
    books: [Book]
    book(id: ID!): Book
    todos: [Todo]
    getdate(input: DateInput!): [Return!] 
  }

  type Mutation {
    createTodo(input: CreateTodoInput!): String
    deleteTodo(id: ID!): String
    updateTodo(input: UpdateTodoInput!): String
  }
`;
