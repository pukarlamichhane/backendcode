import { jobQueue, prisma } from "../connect/dbconnect";
import { client, redisClient } from "../connect/dbconnect";
import { Worker } from "bullmq";
import {
  CreateTodoInput,
  getDate,
  UpdateTodoInput,
} from "../interface/interface";

// Controller to get all Todos
export const getAllTodos = async () => {
  try {
    // Check if data is in cache
    const cachedTodos = await redisClient.get("todos");

    if (cachedTodos) {
      // If cached data exists, return it
      return JSON.parse(cachedTodos);
    }

    // If not in cache, fetch from database
    const todos = await prisma.todo.findMany({ where: { status: false } });

    // Store in cache
    await redisClient.setex("todos", 10, JSON.stringify(todos));

    return todos;
  } catch (error) {
    console.error("Error fetching todos:", error);
    throw error;
  }
};

// Controller to create a new Todo
export const createTodo = async (input: CreateTodoInput) => {
  const { task, description, severity } = input;
  const createdat = new Date();

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
    return "Create sucessfully";
  } catch (error: any) {
    return "Create unsucessfully";
  }
};

// Controller to update an existing Todo
export const updateTodo = async (input: UpdateTodoInput) => {
  const { id, task, description, complete, severity } = input;
  const updatedat = new Date();
  const num = Number(id);
  console.log(num);
  try {
    const job = await jobQueue.add("update", {
      num,
      task,
      description,
      complete,
      severity,
      updatedat,
    });
    console.log("Job created", job.id);
    return "Update sucessfully";
  } catch (error: any) {
    return "Update unsucessfully";
  }
};

// Controller to delete a Todo
export const deleteTodo = async (id: string) => {
  const updatedat = new Date();
  const num = Number(id);

  try {
    const job = await jobQueue.add("delete", { num, updatedat });
    console.log(`Job ID: ${job.id}`);
    console.log(typeof num);
    return "Delete sucessfully";
  } catch (error: any) {
    return "Delete unsucessfully";
  }
};

// Worker to process jobs
export const worker = new Worker(
  "todoapp",
  async (job) => {
    try {
      switch (job.name) {
        case "create":
          await handleCreateJob(job.data);
          break;

        case "update":
          await handleUpdateJob(job.data);
          break;

        case "delete":
          await handleDeleteJob(job.data);
          break;
      }
    } catch (error) {
      console.error(`Error processing ${job.name} job:`, error);
    }
  },
  { connection: redisClient }
);

// Function to handle the creation of a Todo item
async function handleCreateJob(data: any) {
  const { task, severity, description, createdat, updatedat } = data;

  try {
    const newTodo = await prisma.todo.create({
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
    await client.index({
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
  } catch (error) {
    console.error("Error in create job:", error);
  }
}

// Function to handle the update of a Todo item
async function handleUpdateJob(data: any) {
  const { num, task, description, severity, complete, updatedat } = data;
  console.log(data);
  try {
    const updatedTodo = await prisma.todo.update({
      where: { id: num },
      data: {
        task,
        severity,
        description,
        complete,
        updatedat,
      },
    });

    await client.index({
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
  } catch (error) {
    console.error("Error in update job:", error);
  }
}

// Function to handle the deletion of a Todo item
async function handleDeleteJob(data: any) {
  const { num, updatedat } = data;
  console.log(data);
  try {
    const deletedTodo = await prisma.todo.update({
      where: { id: num },
      data: {
        updatedat,
        status: true,
      },
    });

    await client.index({
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
  } catch (error) {
    console.error("Error in delete job:", error);
  }
}

export const Aggregation = async (getdate: getDate) => {
  const { startDate, endDate }: getDate = getdate;
  console.log(startDate, "++++++++++++++++++++");
  console.log(endDate, "++++++++++++++++++++");

  try {
    // Create a unique cache key based on start and end dates
    const cacheKey = `aggregation:${startDate}:${endDate}`;

    // Check if data is in cache
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      // If cached data exists, return it
      return JSON.parse(cachedResult);
    }

    // If not in cache, perform the aggregation
    const result: any = await client.search({
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
      } as any,
    });

    const buckets =
      result.body.aggregations?.severity_distribution?.buckets || [];
    console.log("Severity distribution:", buckets);

    // Map the buckets to the desired format
    const formattedResult = buckets.map((bucket: any) => ({
      key: bucket.key,
      doc_count: bucket.doc_count,
    }));

    // Store in cache
    await redisClient.setex(cacheKey, 10, JSON.stringify(formattedResult));

    return formattedResult;
  } catch (error) {
    console.error("Error fetching severity distribution:", error);
    return [];
  }
};
