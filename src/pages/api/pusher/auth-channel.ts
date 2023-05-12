import type { NextApiResponse } from "next";
import { pusherServerClient } from "~/server/helpers/pusher";
import type { StrictNextApiRequest } from "~/server/helpers/StrictNextApiRequest";
import { prisma } from "~/server/db";

export default async function handler(
  req: StrictNextApiRequest<{
    channel_name: string;
    socket_id: string;
    type: "admin" | "user";
    user_id: string;
  }>,
  res: NextApiResponse
) {
  console.log("req.body", req.body);

  await validateUserToken(req.body.channel_name, req.body.type, req.body.user_id);

  const auth = pusherServerClient.authorizeChannel(req.body.socket_id, req.body.channel_name, {
    user_id: req.body.user_id,
  });
  res.send(auth);
}

async function validateUserToken(
  channelName: string,
  type: "admin" | "user",
  user_id: string
): Promise<boolean> {
  if (channelName === "presence-majalis" || channelName === "private-majalis") {
    if (type === "admin") {
      await prisma.game.findFirstOrThrow({ where: { gameToken: user_id } });
    } else {
      await prisma.user.findFirstOrThrow({ where: { userToken: user_id } });
    }
    return true;
  }

  return false;
}
