import type { NextApiResponse } from 'next'
import { pusherServerClient } from '~/server/helpers/pusher'
import type { StrictNextApiRequest } from "~/server/helpers/StrictNextApiRequest";

export default function handler(req: StrictNextApiRequest<{ socket_id: string }>, res: NextApiResponse) {
  if (!req.headers.user_id || typeof req.headers.user_id !== 'string') {
    res.status(404).send('lol')
    return
  }
  const auth = pusherServerClient.authenticateUser(req.body.socket_id, {
    id: req.headers.user_id,
    name: 'ironman',
  })
  res.send(auth)
}