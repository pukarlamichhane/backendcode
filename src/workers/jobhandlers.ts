import { client, prisma } from "../connect/dbconnect";

// Function to handle the creation of a Todo item
export async function handleCreateJob(data: any) {
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
export async function handleUpdateJob(data: any) {
  const { id, task, description, severity, complete, updatedat } = data;
  console.log(data);
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
export async function handleDeleteJob(data: any) {
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
