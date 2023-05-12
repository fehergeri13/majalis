import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type PrismaClient } from "@prisma/client";
import { omit } from "lodash";

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
      await checkGameStatus(ctx.prisma, input.gameToken, "new");
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
      const user = await ctx.prisma.user.findUniqueOrThrow({where: {userToken: input.userToken}})
      await checkGameStatus(ctx.prisma, user.gameToken, "new");
      await ctx.prisma.user.delete({
        where: {
          userToken: input.userToken,
        },
      });
    }),
  //endregion

  //region getUser
  getUser: publicProcedure.input(z.object({ userToken: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: { userToken: input.userToken },
    });

    return omit(user, "gameToken")
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
      await checkGameStatus(ctx.prisma, input.gameToken, "new")

      await ctx.prisma.game.update({
        where: { gameToken: input.gameToken },
        data: { startedAt: new Date(), stoppedAt: null, status: "started" },
      });
    }),
  //endregion

  //region resetGame
  resetGame: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkGameStatus(ctx.prisma, input.gameToken, "paused")

      await ctx.prisma.game.update({
        where: { gameToken: input.gameToken },
        data: { startedAt: null, stoppedAt: null, status: "new" },
      });

      await ctx.prisma.occupation.deleteMany({
        where: { gameToken: input.gameToken },
      });
    }),
  //endregion

  //region finalizeGame
  finalizeGame: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkGameStatus(ctx.prisma, input.gameToken, "paused")

      await ctx.prisma.game.update({
        where: { gameToken: input.gameToken },
        data: { status: "finished" },
      })
    }),
  //endregion

  //region pauseGame
  pauseGame: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkGameStatus(ctx.prisma, input.gameToken, "started")

      await ctx.prisma.game.update({
        where: { gameToken: input.gameToken },
        data: { stoppedAt: new Date(), status: "paused" },
      });
    }),
  //endregion

  //region resumeGame
  resumeGame: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.prisma.game.findUniqueOrThrow({
        where: { gameToken: input.gameToken },
      })

      await checkGameStatus(ctx.prisma, input.gameToken, "paused")
      if(game.stoppedAt == null) throw new Error("previous line checkGameStatus should already check this")

      const users = await ctx.prisma.user.findMany({where: {gameToken: input.gameToken}})

      const occupations = await Promise.all(users.map(user => {
        return ctx.prisma.occupation.findFirst({
          where: { userToken: user.userToken },
          orderBy: { timestamp: "desc" },
        })
      }))

      for(const occupation of occupations) {
        if(occupation != null && occupation.teamNumber != null) {
          await ctx.prisma.occupation.create({data: {...occupation, teamNumber: null, timestamp: game.stoppedAt, id: undefined}})
          await ctx.prisma.occupation.create({data: {...occupation, timestamp: new Date(), id: undefined}})
        }
      }

      await ctx.prisma.game.update({
        where: { gameToken: input.gameToken },
        data: { stoppedAt: null, status: "started" },
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
      await checkGameStatus(ctx.prisma, input.gameToken, "new")

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
      await checkGameStatus(ctx.prisma, input.gameToken, "new");
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
      await checkGameStatus(ctx.prisma, user.gameToken, "started");

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

  //region getAllOccupation
  getAllOccupation: publicProcedure
    .input(
      z.object({
        gameToken: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.occupation.findMany({
        where: { gameToken: input.gameToken },
        orderBy: { timestamp: "desc" },
      });
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

export async function checkGameStatus(prisma: PrismaClient, gameToken: string, status: "new" | "started" | "paused" | "finished") {
  const game = await prisma.game.findUniqueOrThrow({
    where: { gameToken: gameToken },
  });

  if(game.status !== status) throw new Error(`Game status is invalid. Expected: ${status}, actual ${game.status}`)
  if(status === "new") {
    if (game.startedAt != null) {
      throw new Error(`Invalid game status: ${status}. Game startedAt must be null`);
    } else if (game.stoppedAt != null) {
      throw new Error(`Invalid game status: ${status}. Game stoppedAt must be null`);
    }
  }

  if(status === "started") {
    if (game.startedAt == null) {
      throw new Error(`Invalid game status: ${status}. Game startedAt must be Date`);
    } else if (game.stoppedAt != null) {
      throw new Error(`Invalid game status: ${status}. Game stoppedAt must be null`);
    }
  }

  if(status === "paused") {
    if (game.startedAt == null) {
      throw new Error(`Invalid game status: ${status}. Game startedAt must be Date`);
    } else if (game.stoppedAt == null) {
      throw new Error(`Invalid game status: ${status}. Game stoppedAt must be Date`);
    }
  }

  if(status === "finished") {
    if (game.startedAt == null) {
      throw new Error(`Invalid game status: ${status}. Game startedAt must be Date`);
    } else if (game.stoppedAt == null) {
      throw new Error(`Invalid game status: ${status}. Game stoppedAt must be Date`);
    }
  }
}

export async function validateGameToken(prisma: PrismaClient, gameToken: string) {
  await prisma.game.findUniqueOrThrow({
    where: { gameToken: gameToken },
  });
}

