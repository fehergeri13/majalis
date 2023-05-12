import Pusher, { type PresenceChannel } from "pusher-js";
import { env } from "~/env.mjs";
import { createStore, useStore } from "zustand";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFactoryRef } from "~/utils/useFactoryRef";

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

export function usePusher({
  type,
  authToken,
  autoConnect = true,
}: {
  type: "admin" | "user"
  authToken: string | undefined;
  autoConnect?: boolean;
}) {
  const [pusher, setPusher] = useState<null | Pusher>(null);
  const pusherRef = useRef<null | Pusher>(null);
  const [isConnected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (authToken == null) {
      console.warn(`Warning: authToken is null.`);
      return;
    }
    if (authToken === "") {
      console.warn(`Warning: authToken is empty.`);
      return;
    }

    if (pusher != null) pusher.disconnect();

    const pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: "eu",
      activityTimeout: 10_000,

      userAuthentication: {
        endpoint: "/api/pusher/auth-user",
        transport: "ajax",
      },
      channelAuthorization: {
        endpoint: "/api/pusher/auth-channel",
        transport: "ajax",
        params: { type: type, user_id: authToken },
      },
    });

    pusherClient.connection.bind("connected", () => {
      setConnected(true);
    });

    pusherClient.connection.bind("disconnected", () => {
      setConnected(false);
    });

    pusherClient.connection.bind_global((...args: any[]) => {
      console.log("CON GLOBAL", args);
    });

    pusherRef.current = pusherClient;
    setPusher(pusherClient);
  }, [pusher, type, authToken]);

  useEffect(() => {
    if (autoConnect && pusher == null) {
      connect();
    }
  }, [autoConnect, pusher, connect]);

  useEffect(() => {
    return () => {
      pusherRef.current?.disconnect();
      setPusher(null);
    };
  }, []);

  return { pusher, connect, isConnected };
}

export type MemberStore = { members: string[]; isConnected: (userToken: string) => boolean };

export function usePusherPresenceChannelStore(pusher: Pusher | null, channelName: `presence-${string}`) {
  const store = useFactoryRef(() => {
    return createStore<MemberStore>((_set, _get, _api) => {
      return {
        members: [],
        isConnected: (userToken: string) => {
          return _get().members.includes(userToken);
        },
      };
    });
  }).current;

  useEffect(() => {
    if (pusher == null) return;

    // const channel = pusherWebClient.subscribe(slug);
    const presenceChannel = pusher.subscribe(channelName) as PresenceChannel;

    presenceChannel.bind("pusher:subscription_succeeded", updateMembers);
    presenceChannel.bind("pusher:member_added", updateMembers);
    presenceChannel.bind("pusher:member_removed", updateMembers);

    function updateMembers() {
      const members = presenceChannel.members.members as Record<string, { name: string }>;
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
