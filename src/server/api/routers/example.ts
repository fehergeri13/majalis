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

  createSecret: publicProcedure.mutation(async ({ ctx }) => {
    return ctx.prisma.loginSecrets.create({
      data: {
        name: "Unknown username",
      },
    });
  }),

  saveGameToken: publicProcedure
    .input(z.object({ gameToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.loginSecrets.create({
        data: {
          name: "",
          token: input.gameToken,
        },
      });
    }),

  getAllSecret: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.loginSecrets.findMany();
  }),
});
