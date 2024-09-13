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
exports.Aggregation = exports.deleteIndex = exports.createIndex = exports.worker = exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getAllTodos = void 0;
const dbconnect_1 = require("../connect/dbconnect");
const utils_1 = require("../utils/utils"); // Assuming you have a function to get the current date
const dbconnect_2 = require("../connect/dbconnect");
const bullmq_1 = require("bullmq");
// Controller to get all Todos
const getAllTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield dbconnect_1.prisma.todo.findMany();
        res.json(todos);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
    // try {
    //     const result = await client.search({
    //         index:"todos",
    //         body:{
    //             query: {
    //                 match_all: {}
    //             }
    //         }
    //     })
    //     res.json(result.body.hits.hits);
    // } catch (error:any) {
    //     res.status(500).json({ message: error.message });
    // }
});
exports.getAllTodos = getAllTodos;
// Controller to create a new Todo
const createTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { task, description, severity } = req.body;
    const createdat = new Date();
    console.log(createdat);
    const updatedat = createdat;
    try {
        const job = yield dbconnect_1.jobQueue.add("create", {
            task,
            description,
            severity,
            createdat,
            updatedat,
        });
        console.log(`Job ID: ${job.id}`);
        res.status(200).json({ message: "Successfully created" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createTodo = createTodo;
// Controller to update an existing Todo
const updateTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { num } = req.params;
    console.log(num);
    const id = Number(num);
    const { task, description, complete, severity } = req.body;
    const updatedat = utils_1.getCurrentDate;
    try {
        const job = yield dbconnect_1.jobQueue.add("update", {
            id,
            task,
            description,
            complete,
            severity,
            updatedat,
        });
        console.log(`Job ID: ${job.id}`);
        res.status(200).json({ message: "Successfully updated" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateTodo = updateTodo;
// Controller to delete a Todo
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { num } = req.params;
    const id = Number(num);
    const updatedat = new Date();
    const status = true;
    console.log(num); // Assuming this marks the item as deleted
    try {
        const job = yield dbconnect_1.jobQueue.add("delete", { id, updatedat, status });
        console.log(`Job ID: ${job.id}`);
        res.status(200).json({ message: "Successfully deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteTodo = deleteTodo;
// Worker to process jobs
exports.worker = new bullmq_1.Worker("todoapp", (job) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        switch (job.name) {
            case "create":
                yield handleCreateJob(job.data);
                break;
            case "update":
                yield handleUpdateJob(job.data);
                break;
            case "delete":
                yield handleDeleteJob(job.data);
                break;
        }
    }
    catch (error) {
        console.error(`Error processing ${job.name} job:`, error);
    }
}), { connection: dbconnect_2.redisconnect });
// Function to handle the creation of a Todo item
function handleCreateJob(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { task, severity, description, createdat, updatedat } = data;
        try {
            const newTodo = yield dbconnect_1.prisma.todo.create({
                data: {
                    task,
                    severity,
                    description,
                    createdat,
                    updatedat,
                },
            });
            console.log(newTodo);
            let id = newTodo.id.toString();
            yield dbconnect_2.client.index({
                index: "todos",
                body: {
                    id,
                    severity,
                    task,
                    description,
                    createdat,
                    updatedat,
                    status: `The task was created at ${createdat}`,
                },
            });
            console.log(`Todo item created successfully: ${newTodo.id}`);
        }
        catch (error) {
            console.error("Error in create job:", error);
        }
    });
}
// Function to handle the update of a Todo item
function handleUpdateJob(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, task, description, severity, complete, updatedat } = data;
        console.log(id);
        try {
            const updatedTodo = yield dbconnect_1.prisma.todo.update({
                where: { id },
                data: {
                    task,
                    severity,
                    description,
                    complete,
                    updatedat,
                },
            });
            yield dbconnect_2.client.index({
                index: "todos",
                body: {
                    doc: {
                        id,
                        task,
                        description,
                        severity,
                        updatedat,
                        status: `The task was updated at ${updatedat}`,
                    },
                },
            });
            console.log(`Todo item updated successfully: ${updatedTodo.id}`);
        }
        catch (error) {
            console.error("Error in update job:", error);
        }
    });
}
// Function to handle the deletion of a Todo item
function handleDeleteJob(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, updatedat } = data;
        console.log(data);
        try {
            const deletedTodo = yield dbconnect_1.prisma.todo.update({
                where: { id: id },
                data: {
                    updatedat,
                    status: true,
                },
            });
            yield dbconnect_2.client.index({
                index: "todos",
                body: {
                    doc: {
                        id: id,
                        updatedat,
                        status: `The task was deleted at ${updatedat}`,
                    },
                },
            });
            console.log(`Todo item marked as deleted: ${deletedTodo.id}`);
        }
        catch (error) {
            console.error("Error in delete job:", error);
        }
    });
}
// Controller to create an index in Elasticsearch
const createIndex = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = {
        settings: {
            index: {
                number_of_shards: 4,
                number_of_replicas: 3,
            },
        },
    };
    try {
        const response = yield dbconnect_2.client.indices.create({
            index: "todos",
            body: settings,
        });
        res.status(200).json({ message: "Index created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createIndex = createIndex;
// Controller to delete an index in Elasticsearch
const deleteIndex = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbconnect_2.client.indices.delete({
            index: "todos",
        });
        res.status(200).json({ message: "Index deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteIndex = deleteIndex;
const Aggregation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { start, end } = req.body;
    try {
        const result = yield dbconnect_2.client.search({
            index: "todos",
            body: {
                query: {
                    range: {
                        createdat: {
                            gte: start,
                            lte: end,
                        },
                    },
                },
                aggs: {
                    severity_distribution: {
                        terms: {
                            field: "severity.keyword",
                        },
                    },
                },
            }, // Explicitly cast the body as 'any' to bypass type checks
        });
        res
            .status(200)
            .json((_b = (_a = result.body.aggregations) === null || _a === void 0 ? void 0 : _a.severity_distribution) === null || _b === void 0 ? void 0 : _b.buckets);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
    console.log(start, end, "..................................");
});
exports.Aggregation = Aggregation;
