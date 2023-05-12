import Pusher, { type Channel, type PresenceChannel } from "pusher-js";
import { env } from "~/env.mjs";
import { createStore, useStore } from "zustand";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFactoryRef } from "~/utils/useFactoryRef";
import { useFunctionRefProxy } from "~/components/score/SimpleScore";

export function usePusher({
  type,
  authToken,
  autoConnect = true,
}: {
  type: "admin" | "user";
  authToken: string | undefined;
  autoConnect?: boolean;
}) {
  // Enable pusher logging - don't include this in production
  Pusher.logToConsole = env.NEXT_PUBLIC_NODE_ENV === "development";

  const [pusher, setPusher] = useState<null | Pusher>(null);
  const pusherRef = useRef<null | Pusher>(null);
  const [isConnected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (authToken == null) {
      if(env.NEXT_PUBLIC_NODE_ENV === "development") console.warn(`Warning: authToken is null.`);
      return;
    }
    if (authToken === "") {
      if(env.NEXT_PUBLIC_NODE_ENV === "development") console.warn(`Warning: authToken is empty.`);
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

    if (env.NEXT_PUBLIC_NODE_ENV === "development") {
      pusherClient.connection.bind_global((...args: any[]) => {
        console.log("CON GLOBAL", args);
      });
    }

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

export function usePusherPresenceState(presenceChannel: PresenceChannel | null) {
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

  const updateMembers = useCallback(() => {
    if (presenceChannel == null) return;
    const members = presenceChannel.members.members as Record<string, { name: string }>;
    store.setState(() => ({
      members: Object.keys(members),
    }));
  }, [presenceChannel, store]);

  usePusherBinding(presenceChannel, "pusher:subscription_succeeded", updateMembers);
  usePusherBinding(presenceChannel, "pusher:member_added", updateMembers);
  usePusherBinding(presenceChannel, "pusher:member_removed", updateMembers);

  return useStore(store);
}

type CorrectChannel<TChannelName extends string> = TChannelName extends `presence-${string}`
  ? PresenceChannel
  : Channel;

export function usePusherChannel<TChannelName extends string>(
  pusher: Pusher | null,
  channelName: TChannelName
): CorrectChannel<TChannelName> | null {
  const channel = useRef<Channel | null>(null);

  useEffect(() => {
    if (pusher == null) return;
    channel.current = pusher.subscribe(channelName);
  }, [pusher, channelName]);

  return channel.current as CorrectChannel<TChannelName> | null;
}

export function usePusherBinding(
  channel: Channel | null,
  eventName: string,
  onEvent: (data: unknown) => void
) {
  const handler = useFunctionRefProxy(onEvent);

  useEffect(() => {
    if (channel == null) return;
    channel.bind(eventName, handler);

    return () => {
      channel.unbind(eventName, handler);
    };
  }, [channel, eventName, handler]);
}
