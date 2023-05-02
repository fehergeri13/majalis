import Pusher, { type PresenceChannel } from "pusher-js";
import { env } from "~/env.mjs";
import { createStore, useStore } from "zustand";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFactoryRef } from "~/utils/useFactoryRef";

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

export function usePusher({
  gameToken,
  userToken,
  autoConnect = true,
}: {
  gameToken: string | undefined;
  userToken: string | undefined;
  autoConnect?: boolean;
}) {
  const [pusher, setPusher] = useState<null | Pusher>(null);
  const pusherRef = useRef<null | Pusher>(null);
  const [isConnected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (gameToken == null || userToken == null || userToken === "") {
      console.warn("gameToken or userToken is empty", {
        gameToken: gameToken,
        userToken: userToken,
      });
      return;
    }

    if (pusher != null) pusher.disconnect();

    const pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: "eu",

      userAuthentication: {
        endpoint: "/api/pusher/auth-user",
        transport: "ajax",
      },
      channelAuthorization: {
        endpoint: "/api/pusher/auth-channel",
        transport: "ajax",
        params: { gameToken: gameToken, user_id: userToken },
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
  }, [pusher, gameToken, userToken]);

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

export function usePusherPresenceChannelStore(pusher: Pusher | null, channelName: `presence-${string}`) {
  const store = useFactoryRef(() => {
    return createStore<{ members: string[]; isConnected: (userToken: string) => boolean }>(
      (_set, _get, _api) => {
        return {
          members: [],
          isConnected: (userToken: string) => {
            return _get().members.includes(userToken);
          },
        };
      }
    );
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
