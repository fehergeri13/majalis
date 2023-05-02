import type { NextApiResponse } from "next";
import { pusherServerClient } from "~/server/helpers/pusher";
import type { StrictNextApiRequest } from "~/server/helpers/StrictNextApiRequest";
import { prisma } from "~/server/db";

export default async function handler(
  req: StrictNextApiRequest<{
    channel_name: string;
    socket_id: string;
    user_id: string;
    gameToken: string;
  }>,
  res: NextApiResponse
) {
  console.log("req.body", req.body);

  await validateUserToken(req.body.channel_name, req.body.gameToken, req.body.user_id);

  const auth = pusherServerClient.authorizeChannel(req.body.socket_id, req.body.channel_name, {
    user_id: req.body.user_id,
  });
  res.send(auth);
}

async function validateUserToken(
  channelName: string,
  gameToken: string,
  userToken: string
): Promise<boolean> {
  if (channelName !== "presence-majalis") return false;

  await prisma.game.findFirstOrThrow({ where: { gameToken } });

  if (userToken === "admin") return true;

  await prisma.user.findFirstOrThrow({ where: { gameToken, userToken } });

  return true;
}
