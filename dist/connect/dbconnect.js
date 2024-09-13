"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.books = exports.jobQueue = exports.redisconnect = exports.client = exports.prisma = void 0;
const opensearch_1 = require("@opensearch-project/opensearch");
const client_1 = require("@prisma/client");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
exports.prisma = new client_1.PrismaClient;
exports.client = new opensearch_1.Client({
    node: "http://localhost:9200"
});
exports.redisconnect = new ioredis_1.default({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null,
});
exports.jobQueue = new bullmq_1.Queue('todoapp', { connection: exports.redisconnect });
exports.books = [
    {
        id: "1",
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        id: "2",
        title: 'City of Glass',
        author: 'Paul Auster',
    },
];
