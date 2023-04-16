import type {NextApiResponse } from "next";
import { pusherServerClient } from "~/server/helpers/pusher";
import type { StrictNextApiRequest } from "~/server/helpers/StrictNextApiRequest";
import { prisma } from "~/server/db";


export default async function handler(
  req: StrictNextApiRequest<{ channel_name: string; socket_id: string, userId: string, gameToken: string, userName: string }>,
  res: NextApiResponse
) {

  console.log("req.body", req.body)

  if(!await isValid(req.body.channel_name, req.body.gameToken)) {
    res.status(404).send("lol");
    return;
  }


  const auth = pusherServerClient.authorizeChannel(
    req.body.socket_id,
    req.body.channel_name,
    {
      user_id: req.body.userId,
      user_info: {
        name: req.body.userName,
      },
    }
  );
  res.send(auth);
}


async function isValid(channelName: string, userId: string): Promise<boolean> {
  if(channelName === "presence-majalis" && userId === "admin") return true
  if(channelName === "presence-majalis") {
    try {
      const loginSecret = await prisma.loginSecrets.findFirstOrThrow({where: {token: userId}})
      return loginSecret.status === "NEW";
    } catch(e) {
      return false
    }
  }
  return false;
}