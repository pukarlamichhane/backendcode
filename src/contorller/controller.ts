import { Request, Response } from "express";
import { jobQueue, prisma } from "../connect/dbconnect";
import { client, redisClient } from "../connect/dbconnect";
import { Worker } from "bullmq";

export const getAllTodos = async (req: Request, res: Response) => {
  try {
    // Check if data is in cache
    const cachedTodos = await redisClient.get("todos");

    if (cachedTodos) {
      // If cached data exists, return it
      return res.json(JSON.parse(cachedTodos));
    }

    // If not in cache, fetch from database
    const todos = await prisma.todo.findMany({ where: { status: false } });

    // Store in cache
    await redisClient.setex("todos", 10, JSON.stringify(todos));

    res.json(todos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to create a new Todo
export const createTodo = async (req: Request, res: Response) => {
  const { task, description, severity } = req.body;
  const createdat = new Date();
  console.log(createdat);

  const updatedat = createdat;

  try {
    const job = await jobQueue.add("create", {
      task,
      description,
      severity,
      createdat,
      updatedat,
    });
    console.log(`Job ID: ${job.id}`);
    res.status(200).json({ message: "Successfully created" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Controller to update an existing Todo
export const updateTodo = async (req: Request, res: Response) => {
  const { num } = req.params;
  console.log(num);
  const id = Number(num);
  const { task, description, complete, severity } = req.body;
  const updatedat = new Date();

  try {
    const job = await jobQueue.add("update", {
      id,
      task,
      description,
      complete,
      severity,
      updatedat,
    });
    console.log(`Job ID: ${job.id}`);
    res.status(200).json({ message: "Successfully updated" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to delete a Todo
export const deleteTodo = async (req: Request, res: Response) => {
  const { num } = req.params;
  const id: Number = Number(num);
  const updatedat: Date = new Date();
  const status: Boolean = true;

  try {
    const job = await jobQueue.add("delete", { id, updatedat, status });
    console.log(`Job ID: ${job.id}`);
    res.status(200).json({ message: "Successfully deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to create an index in Elasticsearch
export const createIndex = async (req: Request, res: Response) => {
  const settings = {
    settings: {
      index: {
        number_of_shards: 4,
        number_of_replicas: 3,
      },
    },
  };

  try {
    const response = await client.indices.create({
      index: "todos",
      body: settings,
    });

    res.status(200).json({ message: "Index created successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to delete an index in Elasticsearch
export const deleteIndex = async (req: Request, res: Response) => {
  try {
    await client.indices.delete({
      index: "todos",
    });
    res.status(200).json({ message: "Index deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const Aggregation = async (req: Request, res: Response) => {
  const { start, end }: any = req.body;

  try {
    // Create a unique cache key based on start and end dates
    const cacheKey = `aggregation:${start}:${end}`;

    // Check if data is in cache
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      // If cached data exists, return it
      return res.status(200).json(JSON.parse(cachedResult));
    }

    // If not in cache, perform the aggregation
    const result: any = await client.search({
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
      } as any, // Explicitly cast the body as 'any' to bypass type checks
    });

    const aggregationResult =
      result.body.aggregations?.severity_distribution?.buckets;

    // Store in cache
    await redisClient.setex(cacheKey, 10, JSON.stringify(aggregationResult));

    res.status(200).json(aggregationResult);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
