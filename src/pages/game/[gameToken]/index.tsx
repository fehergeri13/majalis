import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { generateRandomToken, getOrigin, QrCodeImage } from "~/pages/admin";
import Link from "next/link";
import { usePusher, usePusherPresenceChannelStore } from "~/utils/pusher";

const Game: NextPage = () => {
  const router = useRouter();
  const gameToken = router.query.gameToken as string;
  const getTokenQuery = api.example.checkGameToken.useQuery({ gameToken }, { enabled: gameToken != null });
  const allUserQuery = api.example.getAllUser.useQuery({ gameToken }, { enabled: getTokenQuery.isSuccess });
  const addUserMutation = api.example.addUserToken.useMutation();

  const { pusher, isConnected } = usePusher({ gameToken: gameToken, userToken: "admin", autoConnect: true });
  const memberStore = usePusherPresenceChannelStore(pusher, "presence-majalis");

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4">
        {getTokenQuery.isSuccess && (
          <>
            <div>Connection status: {isConnected ? "Connected" : "Offline"}</div>

            <h3>User list</h3>

            <ul className="space-y-4">
              {allUserQuery.data?.length === 0 && <>No user created yet</>}
              {allUserQuery.data?.map((user) => (
                <li key={user.id} className="flex items-center space-x-4 rounded border border-gray-300 p-2">
                  <QrCodeImage data={`${getOrigin()}/game/${gameToken}/${user.userToken}`} />
                  <div>{user.userName !== "" ? user.userName : "No-name"}</div>
                  <div>{memberStore.isConnected(user.userToken) ? "Connected" : "Offline"}</div>
                  <Link href={`/game/${gameToken}/${user.userToken}`} target="_blank">
                    Open user page
                  </Link>
                </li>
              ))}
            </ul>

            <button
              className="px-2 py-1 border border-gray-200 bg-blue-500 rounded mt-4 text-white hover:bg-blue-600 active:bg-blue-700"
              onClick={async () => {
                await addUserMutation.mutateAsync({ gameToken, userToken: generateRandomToken() });
                await allUserQuery.refetch();
              }}
            >
              Generate user QR code
            </button>
          </>
        )}
        {getTokenQuery.isError && <>There is an error with this game token</>}
      </main>
    </>
  );
};

export default Game;
