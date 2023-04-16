import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.loginSecrets.findMany();
  }),

  createSecret: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.loginSecrets.create({
      data: {
        name: "",
      },
    });
  }),

  getAllSecret: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.loginSecrets.findMany();
  }),
});
