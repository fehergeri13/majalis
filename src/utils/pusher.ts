import Pusher, { type PresenceChannel } from "pusher-js";
import { env } from "~/env.mjs";
import { createStore, useStore } from "zustand";
import { useEffect } from "react";
import { useFactoryRef } from "~/utils/useFactoryRef";

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

const randomUserId = `random-user-id:${Math.random().toFixed(7)}`;
console.log("randomUserId", randomUserId);

export function usePusher(user_id: string) {
  const pusher = useFactoryRef(() => {
    return new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: "eu",

      userAuthentication: {
        endpoint: "/api/pusher/auth-user",
        transport: "ajax",
      },
      channelAuthorization: {
        endpoint: "/api/pusher/auth-channel",
        transport: "ajax",
        headers: { user_id: user_id },
      },
    });
  }).current;

  useEffect(() => {
    pusher.connect()
    return () => {
      pusher.disconnect();
    };
  }, [pusher]);

  return pusher;
}

export function usePusherPresenceChannelStore(
  pusher: Pusher,
  channelName: `presence-${string}`
) {
  const store = useFactoryRef(() => {
    return createStore<{ members: string[] }>((_set, _get, _api) => {
      return {
        members: [],
      };
    });
  }).current;

  useEffect(() => {
    // const channel = pusherWebClient.subscribe(slug);
    const presenceChannel = pusher.subscribe(channelName) as PresenceChannel;

    presenceChannel.bind("pusher:subscription_succeeded", updateMembers);
    presenceChannel.bind("pusher:member_added", updateMembers);
    presenceChannel.bind("pusher:member_removed", updateMembers);

    function updateMembers() {
      const members = presenceChannel.members.members as Record<
        string,
        { name: string }
      >;
      console.log("presenceChannel.members", presenceChannel.members);

      store.setState(() => ({
        members: Object.keys(members),
      }));
    }

    return () => {
      presenceChannel.unbind_all();
      presenceChannel.disconnect();
    };
  }, [pusher, channelName, store]);

  return useStore(store);
}
