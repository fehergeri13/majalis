import Pusher, { type PresenceChannel } from "pusher-js";
import { env } from "~/env.mjs";
import { createStore } from "zustand";

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

const randomUserId = `random-user-id:${Math.random().toFixed(7)}`;
console.log("randomUserId", randomUserId);

export const pusherWebClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: "eu",
  userAuthentication: {
    endpoint: "/api/pusher/auth-user",
    transport: "ajax",
  },
  channelAuthorization: {
    endpoint: "/api/pusher/auth-channel",
    transport: "ajax",
    headers: { user_id: randomUserId },
  },
});



export const pusherStore = createStore<{ members: string[] }>((set, get, api) => {
  return {
    members: [],
  };
});

const slug = "majalis";
// const channel = pusherWebClient.subscribe(slug);
const presenceChannel = pusherWebClient.subscribe(
  `presence-${slug}`
) as PresenceChannel;

const updateMembers = () => {
  const members = presenceChannel.members.members as Record<string, {name: string}>

  console.log("asd")
  console.log(presenceChannel.members.members)
  pusherStore.setState(() => ({
    members: Object.keys(members),
  }))
}

// Bind all "present users changed" events to trigger updateMembers
presenceChannel.bind('pusher:subscription_succeeded', updateMembers)
presenceChannel.bind('pusher:member_added', updateMembers)
presenceChannel.bind('pusher:member_removed', updateMembers)


export function hello() {
  return 1
}