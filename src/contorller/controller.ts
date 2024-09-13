import { Request, Response } from "express";
import { jobQueue, prisma } from "../connect/dbconnect";
import { getCurrentDate } from "../utils/utils"; // Assuming you have a function to get the current date
import { client, redisconnect } from "../connect/dbconnect";
import { Worker } from "bullmq";

// Controller to get all Todos
export const getAllTodos = async (req: Request, res: Response) => {
  try {
    const todos = await prisma.todo.findMany();
    res.json(todos);
  } catch (error: any) {
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
  const updatedat = getCurrentDate;

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
  const id = Number(num);
  const updatedat = new Date();
  const status = true;
  console.log(num); // Assuming this marks the item as deleted

  try {
    const job = await jobQueue.add("delete", { id, updatedat, status });
    console.log(`Job ID: ${job.id}`);
    res.status(200).json({ message: "Successfully deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
  { connection: redisconnect }
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
  const { id, task, description, severity, complete, updatedat } = data;
  console.log(id);
  try {
    const updatedTodo = await prisma.todo.update({
      where: { id },
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
  } catch (error) {
    console.error("Error in update job:", error);
  }
}

// Function to handle the deletion of a Todo item
async function handleDeleteJob(data: any) {
  const { id, updatedat } = data;
  console.log(data);
  try {
    const deletedTodo = await prisma.todo.update({
      where: { id: id },
      data: {
        updatedat,
        status: true,
      },
    });

    await client.index({
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
  } catch (error) {
    console.error("Error in delete job:", error);
  }
}

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

    res
      .status(200)
      .json(result.body.aggregations?.severity_distribution?.buckets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
  console.log(start, end, "..................................");
};
