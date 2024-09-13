"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const controller_1 = require("../contorller/controller");
exports.router = express_1.default.Router();
exports.router.get("/gettodo", controller_1.getAllTodos);
exports.router.post("/create", controller_1.createTodo);
exports.router.delete("/delete/:num", controller_1.deleteTodo);
exports.router.put("/put/:num", controller_1.updateTodo);
exports.router.get("/deleteindex", controller_1.deleteIndex);
exports.router.get("/createindex", controller_1.createIndex);
exports.router.post("/getagg", controller_1.Aggregation);
