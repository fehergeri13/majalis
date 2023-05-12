import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type PrismaClient } from "@prisma/client";

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
          userName: "Névtelen",
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

  //region deleteUser
  deleteUser: publicProcedure
    .input(
      z.object({
        userToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.delete({
        where: {
          userToken: input.userToken,
        },
      });
    }),
  //endregion

  //region getUser
  getUser: publicProcedure.input(z.object({ userToken: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { userToken: input.userToken },
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

  //region deleteTeam
  deleteTeam: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await validateGameToken(ctx.prisma, input.gameToken);
      await ctx.prisma.team.delete({ where: { id: input.id } });
    }),
  //endregion

  //region getAllTeam
  getAllTeam: publicProcedure
    .input(
      z.union([
        z.object({
          userToken: z.string(),
        }),
        z.object({
          gameToken: z.string(),
        }),
      ])
    )
    .query(async ({ ctx, input }) => {
      let gameToken;
      if ("gameToken" in input) {
        gameToken = input.gameToken;
      } else {
        const user = await ctx.prisma.user.findUniqueOrThrow({ where: { userToken: input.userToken } });
        gameToken = user.gameToken;
      }

      return await ctx.prisma.team.findMany({ where: { gameToken } });
    }),
  //endregion

  //region occupyBase
  occupyBase: publicProcedure
    .input(
      z.object({
        userToken: z.string(),
        teamNumber: z.union([z.number().positive(), z.null()]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUniqueOrThrow({ where: { userToken: input.userToken } });
      await checkGameIsLive(ctx.prisma, user.gameToken);

      await ctx.prisma.occupation.create({
        data: { gameToken: user.gameToken, userToken: input.userToken, teamNumber: input.teamNumber },
      });
    }),
  //endregion

  //region getOccupation
  getOccupation: publicProcedure
    .input(
      z.object({
        userToken: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const occupation = await ctx.prisma.occupation.findFirst({
        where: { userToken: input.userToken },
        orderBy: { timestamp: "desc" },
      });

      if (occupation == null) return null;
      if (occupation.teamNumber == null) return null;

      return await ctx.prisma.team.findUniqueOrThrow({ where: { id: occupation.teamNumber } });
    }),
  //endregion

  //region getScoreInput
  getScoreInput: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const game = await ctx.prisma.game.findUniqueOrThrow({
        where: { gameToken: input.gameToken },
      });

      const users = await ctx.prisma.user.findMany({
        where: { gameToken: input.gameToken },
      });

      const occupations = await ctx.prisma.occupation.findMany({
        where: {
          gameToken: input.gameToken,
          timestamp: { gte: game.startedAt ?? new Date(0), lte: game.stoppedAt ?? new Date(9999999999999) },
        },
        orderBy: { timestamp: "asc" },
      });

      const teams = await ctx.prisma.team.findMany({
        where: { gameToken: input.gameToken },
      });

      return { users, occupations, teams };
    }),
  //endregion
});

export async function checkGameIsLive(prisma: PrismaClient, gameToken: string) {
  const game = await prisma.game.findFirstOrThrow({
    where: { gameToken: gameToken },
  });

  if (game.startedAt === null) throw new Error("Game not started yet");
  if (game.stoppedAt !== null) throw new Error("Game is already stopped");
}

export async function validateGameToken(prisma: PrismaClient, gameToken: string) {
  await prisma.game.findFirstOrThrow({
    where: { gameToken: gameToken },
  });
}
