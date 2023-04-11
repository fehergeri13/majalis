import Pusher from "pusher-js";
import { env } from "~/env.mjs";

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

const randomUserId = `random-user-id:${Math.random().toFixed(7)}`
console.log("randomUserId", randomUserId)

export const pusherWebClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: 'eu',
  userAuthentication: {
    endpoint: "/api/pusher/auth-user",
    transport: "ajax"
  },
  channelAuthorization: {
    endpoint: "/api/pusher/auth-channel",
    transport: "ajax",
    headers: { user_id: randomUserId },
  },
});

