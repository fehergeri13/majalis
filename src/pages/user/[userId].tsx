import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { usePusher, usePusherPresenceChannelStore } from "~/utils/pusher";
import { useState } from "react";

const User: NextPage = () => {
  const [userName, setUserName] = useState("");

  const router = useRouter();
  const userId = router.query.userId as string;

  const { pusher, connect, isConnected } = usePusher({ userId: userId, userName: userName, autoConnect: false });
  usePusherPresenceChannelStore(pusher, "presence-majalis");
  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4">
        {!isConnected && (
          <>
            <label className="flex items-baseline gap-1">
              Username:
              <input
                type="text"
                onChange={(e) => setUserName(e.target.value)}
                className="block rounded border border-gray-200 px-2 py-1"
                value={userName}
              />
            </label>
            <button
              onClick={connect}
              className="block rounded bg-gray-200 px-2 py-1"
            >
              Connect
            </button>
          </>
        )}
        {isConnected && <>Hello {userName}</>}
      </main>
    </>
  );
};

export default User;
