import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    };
  }),

  //region saveGameToken
  saveGameToken: publicProcedure
    .input(z.object({ gameToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.game.create({
        data: {
          gameToken: input.gameToken,
        },
      });
    }),
  //endregion

  //region getGame
  getGame: publicProcedure
    .input(z.object({ gameToken: z.union([z.string(), z.undefined()]) }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.game.findFirstOrThrow({
        where: { gameToken: input.gameToken },
      });
    }),
  //endregion

  //region addUserToken
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
  //endregion

  //region saveUserName
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
  //endregion

  //region getUser
  getUser: publicProcedure
    .input(z.object({ gameToken: z.string(), userToken: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findFirstOrThrow({
        where: { gameToken: input.gameToken, userToken: input.userToken },
      });
    }),
  //endregion

  //region getAllUser
  getAllUser: publicProcedure.input(z.object({ gameToken: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.user.findMany({
      where: { gameToken: input.gameToken },
    });
  }),
  //endregion

  //region startGame
  startGame: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.game.update({
        where: { gameToken: input.gameToken },
        data: { startedAt: new Date(), stoppedAt: null },
      });
    }),
  //endregion

  //region stopGame
  stopGame: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.game.update({
        where: { gameToken: input.gameToken },
        data: { stoppedAt: new Date() },
      });
    }),
  //endregion

  //region addTeam
  addTeam: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.game.findFirstOrThrow({
        where: { gameToken: input.gameToken, startedAt: null },
      });

      await ctx.prisma.team.create({
        data: { gameToken: input.gameToken, name: "", color: "#14c91d" },
      });
    }),
  //endregion

  //region updateTeam
  updateTeam: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        gameToken: z.string(),
        color: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.team.findFirstOrThrow({
        where: { id: input.id, gameToken: input.gameToken },
      });
      await ctx.prisma.team.update({
        where: { id: input.id },
        data: { name: input.name, color: input.color },
      });
    }),
  //endregion

  //region getAllTeam
  getAllTeam: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.team.findMany({
        where: { gameToken: input.gameToken },
      });
    }),
  //endregion

  //region occupyBase
  occupyBase: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
        userToken: z.string(),
        teamNumber: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.game.findFirstOrThrow({
        where: { gameToken: input.gameToken, startedAt: { not: null }, stoppedAt: null },
      });

      await ctx.prisma.occupation.create({
        data: { gameToken: input.gameToken, userToken: input.userToken, teamNumber: input.teamNumber },
      });
    }),
  //endregion
});
