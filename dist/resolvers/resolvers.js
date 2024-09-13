"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const dbconnect_1 = require("../connect/dbconnect");
const controller_1 = require("../contorller/controller");
exports.resolvers = {
    Query: {
        books: () => dbconnect_1.books,
        greet: () => "Hello world",
        book: (_, args) => {
            const foundBook = dbconnect_1.books.find((book) => book.id === args.id);
            return foundBook || null;
        },
        todos: controller_1.getAllTodos,
        getdate: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(args.input);
                const result = yield (0, controller_1.Aggregation)(args.input);
                return result;
            }
            catch (error) {
                console.error("Error fetching date range data:", error);
            }
        }),
    },
    Mutation: {
        createTodo: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const result = (0, controller_1.createTodo)(args.input);
            return result;
        }),
        updateTodo: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(args.input);
            const result = (0, controller_1.updateTodo)(args.input);
            return result;
        }),
        deleteTodo: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const result = (0, controller_1.deleteTodo)(args.id);
            return result;
        }),
    },
};
