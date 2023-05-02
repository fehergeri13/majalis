import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    };
  }),

  saveGameToken: publicProcedure
    .input(z.object({ gameToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.game.create({
        data: {
          gameToken: input.gameToken,
        },
      });
    }),

  checkGameToken: publicProcedure
    .input(z.object({ gameToken: z.union([z.string(), z.undefined()]) }))
    .query(async ({ ctx, input }) => {
      console.log("checking game token", input.gameToken);

      return await ctx.prisma.game.findFirstOrThrow({
        where: { gameToken: input.gameToken },
      });
    }),

  addUserToken: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
        userToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: {
          gameToken: input.gameToken,
          userToken: input.userToken,
          userName: "",
        },
      });
    }),

  saveUserName: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
        userToken: z.string(),
        userName: z.string().min(3),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirstOrThrow({
        where: {
          gameToken: input.gameToken,
          userToken: input.userToken,
        },
      });

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { userName: input.userName },
      });
    }),

  getUser: publicProcedure
    .input(z.object({ gameToken: z.string(), userToken: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findFirstOrThrow({
        where: { gameToken: input.gameToken, userToken: input.userToken },
      });
    }),

  getAllUser: publicProcedure.input(z.object({ gameToken: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.user.findMany({
      where: { gameToken: input.gameToken },
    });
  }),
});
