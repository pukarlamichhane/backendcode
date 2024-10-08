import express, { Express } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { router } from "./routes/routes";
import TodoAppWorker from "./workers/workers";

const app: Express = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());

app.use("/api", router);

new TodoAppWorker();

app.listen(3000, () => {
  console.log(`Server is listening at port :3000`);
});

export default app;
