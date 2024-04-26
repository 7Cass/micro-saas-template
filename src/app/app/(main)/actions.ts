"use server";
import { auth } from "@/services/auth";
import { prisma } from "@/services/database";
import { z } from "zod";
import { deleteTodoSchema, upsertTodoSchema } from "./schemas";

export async function getUserTodos() {
  const session = await auth();
  const todos = await prisma.todo.findMany({
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return todos;
}

export async function upsertTodo(input: z.infer<typeof upsertTodoSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Not authorized.",
      data: null,
    };
  }

  if (input.id) {
    const updatedTodo = await prisma.todo.update({
      where: {
        id: input.id,
        userId: session?.user?.id,
      },
      data: {
        title: input.title,
        doneAt: input.doneAt,
      },
    });

    return {
      error: null,
      data: updatedTodo,
    };
  }

  if (!input.title) {
    return {
      error: "Title is required.",
      data: null,
    };
  }

  const newTodo = await prisma.todo.create({
    data: {
      userId: session?.user?.id,
      title: input.title,
    },
  });

  return {
    error: null,
    data: newTodo,
  };
}

export async function deleteTodo(input: z.infer<typeof deleteTodoSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Not authorized.",
      data: null,
    };
  }

  if (input.id) {
    await prisma.todo.delete({
      where: {
        id: input.id,
        userId: session?.user?.id,
      },
    });

    return {
      error: null,
      data: "Todo deleted succesfully.",
    };
  }
}
