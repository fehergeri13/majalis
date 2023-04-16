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
      console.log("token created")
      return ctx.prisma.loginSecrets.create({
        data: {
          name: "",
          token: input.gameToken,
        },
      });
    }),

  getToken: publicProcedure.input(z.object({ gameToken: z.union([z.string(), z.undefined()]) })).query(async ({ ctx, input }) => {
    return await ctx.prisma.loginSecrets.findFirstOrThrow({where: {token:input.gameToken }});
  }),

  getAllSecret: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.loginSecrets.findMany();
  }),
});
