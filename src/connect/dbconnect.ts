import { Client } from "@opensearch-project/opensearch";
import { PrismaClient } from "@prisma/client";
import { Queue } from "bullmq";
import IORedis from "ioredis";

export const prisma: PrismaClient = new PrismaClient();

export const client: Client = new Client({
  node: "http://localhost:9200",
});

export const redisClient: IORedis = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

export const jobQueue = new Queue("todoapp", { connection: redisClient });
