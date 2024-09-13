import { books } from "../connect/dbconnect";
import {
  Aggregation,
  createTodo,
  deleteTodo,
  getAllTodos,
  updateTodo,
} from "../contorller/controller";
// Fixed typo: contorller => controller
import {
  CreateTodoInput,
  getDate,
  UpdateTodoInput,
} from "../interface/interface";

export const resolvers = {
  Query: {
    books: () => books,
    greet: () => "Hello world",
    book: (_: any, args: { id: string }) => {
      const foundBook = books.find((book) => book.id === args.id);
      return foundBook || null;
    },
    todos: getAllTodos,

    getdate: async (_: any, args: { input: getDate }) => {
      try {
        console.log(args.input);
        const result = await Aggregation(args.input);
        return result;
      } catch (error) {
        console.error("Error fetching date range data:", error);
      }
    },
  },

  Mutation: {
    createTodo: async (_: any, args: { input: CreateTodoInput }) => {
      const result = createTodo(args.input);
      return result;
    },

    updateTodo: async (_: any, args: { input: UpdateTodoInput }) => {
      console.log(args.input);
      const result = updateTodo(args.input);
      return result;
    },

    deleteTodo: async (_: any, args: { id: string }) => {
      const result = deleteTodo(args.id);
      return result;
    },
  },
};
