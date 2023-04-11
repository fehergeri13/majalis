import type {NextApiResponse } from "next";
import { pusherServerClient } from "~/server/helpers/pusher";
import type { StrictNextApiRequest } from "~/server/helpers/StrictNextApiRequest";


export default function handler(
  req: StrictNextApiRequest<{ channel_name: string; socket_id: string }>,
  res: NextApiResponse
) {
  if (!req.headers.user_id || typeof req.headers.user_id !== "string") {
    res.status(404).send("lol");
    return;
  }

  const auth = pusherServerClient.authorizeChannel(
    req.body.socket_id,
    req.body.channel_name,
    {
      user_id: req.headers.user_id,
      user_info: {
        name: "superman",
      },
    }
  );
  res.send(auth);
}
