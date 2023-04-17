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

  saveGameToken: publicProcedure
    .input(z.object({ gameToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log("token created");
      return ctx.prisma.game.create({
        data: {
          gameToken: input.gameToken,
        },
      });
    }),

  checkGameToken: publicProcedure
    .input(z.object({ gameToken: z.union([z.string(), z.undefined()]) }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.game.findFirstOrThrow({
        where: { gameToken: input.gameToken },
      });
    }),

  saveUserToken: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
        userToken: z.string(),
        userName: z.string().min(3),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("token created");
      return ctx.prisma.user.create({
        data: {
          gameToken: input.gameToken,
          userToken: input.userToken,
          userName: input.userName,
        },
      });
    }),

  checkUserToken: publicProcedure
    .input(z.object({ gameToken: z.string(), userToken: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log("token created");
      return ctx.prisma.user.findFirstOrThrow({
        where: { gameToken: input.gameToken, userToken: input.userToken },
      });
    }),
});
