import { Job, Worker } from "bullmq";
import { redisClient } from "../connect/dbconnect"; // Adjust the path as necessary
import {
  handleCreateJob,
  handleUpdateJob,
  handleDeleteJob,
} from "./jobhandlers"; // Adjust the path

class TodoAppWorker {
  private worker: Worker;

  constructor() {
    // Initialize the worker with the queue name and options (including Redis connection)
    this.worker = new Worker(
      "todoapp",
      this.processJob.bind(this), // Job processor function
      { connection: redisClient } // Options (second argument)
    );
  }

  // Method defined outside the constructor
  private async processJob(job: Job) {
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

        default:
          console.warn(`Unknown job type: ${job.name}`);
          break;
      }
    } catch (error) {
      console.error(`Error processing ${job.name} job:`, error);
    }
  }
}

export default TodoAppWorker;
