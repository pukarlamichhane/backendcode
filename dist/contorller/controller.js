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
exports.Aggregation = exports.worker = exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getAllTodos = void 0;
const dbconnect_1 = require("../connect/dbconnect");
const dbconnect_2 = require("../connect/dbconnect");
const bullmq_1 = require("bullmq");
// Controller to get all Todos
const getAllTodos = () => __awaiter(void 0, void 0, void 0, function* () {
    const todos = yield dbconnect_1.prisma.todo.findMany({ where: { status: false } });
    return todos;
});
exports.getAllTodos = getAllTodos;
// Controller to create a new Todo
const createTodo = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { task, description, severity } = input;
    const createdat = new Date();
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
        return "Create sucessfully";
    }
    catch (error) {
        return "Create unsucessfully";
    }
});
exports.createTodo = createTodo;
// Controller to update an existing Todo
const updateTodo = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, task, description, complete, severity } = input;
    const updatedat = new Date();
    const num = Number(id);
    console.log(num);
    try {
        const job = yield dbconnect_1.jobQueue.add("update", {
            num,
            task,
            description,
            complete,
            severity,
            updatedat,
        });
        console.log("Job created", job.id);
        return "Update sucessfully";
    }
    catch (error) {
        return "Update unsucessfully";
    }
});
exports.updateTodo = updateTodo;
// Controller to delete a Todo
const deleteTodo = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedat = new Date();
    const num = Number(id);
    try {
        const job = yield dbconnect_1.jobQueue.add("delete", { num, updatedat });
        console.log(`Job ID: ${job.id}`);
        console.log(typeof num);
        return "Delete sucessfully";
    }
    catch (error) {
        return "Delete unsucessfully";
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
        const { num, task, description, severity, complete, updatedat } = data;
        console.log(data);
        try {
            const updatedTodo = yield dbconnect_1.prisma.todo.update({
                where: { id: num },
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
                        id: num,
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
        const { num, updatedat } = data;
        console.log(data);
        try {
            const deletedTodo = yield dbconnect_1.prisma.todo.update({
                where: { id: num },
                data: {
                    updatedat,
                    status: true,
                },
            });
            yield dbconnect_2.client.index({
                index: "todos",
                body: {
                    doc: {
                        id: num,
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
const Aggregation = (getdate) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { startDate, endDate } = getdate;
    console.log(startDate, "++++++++++++++++++++");
    console.log(endDate, "++++++++++++++++++++");
    try {
        const result = yield dbconnect_2.client.search({
            index: "todos",
            body: {
                query: {
                    range: {
                        createdat: {
                            gte: startDate,
                            lte: endDate,
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
            },
        });
        const buckets = ((_b = (_a = result.body.aggregations) === null || _a === void 0 ? void 0 : _a.severity_distribution) === null || _b === void 0 ? void 0 : _b.buckets) || [];
        console.log("Severity distribution:", buckets);
        // Map the buckets to the desired format and return
        return buckets.map((bucket) => ({
            key: bucket.key,
            doc_count: bucket.doc_count,
        }));
    }
    catch (error) {
        console.error("Error fetching severity distribution:", error);
        return [];
    }
});
exports.Aggregation = Aggregation;
