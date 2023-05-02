import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { generateRandomToken, getOrigin, QrCodeImage } from "~/pages/admin";
import Link from "next/link";
import { usePusher, usePusherPresenceChannelStore } from "~/utils/pusher";
import { ConnectionDot } from "~/components/ConnectionDot";
import { useState } from "react";
import { IconExternalLink, IconQrcode } from "@tabler/icons-react";

const Game: NextPage = () => {
  const router = useRouter();
  const gameToken = router.query.gameToken as string;
  const getGameQuery = api.example.getGame.useQuery({ gameToken }, { enabled: gameToken != null });
  const allUserQuery = api.example.getAllUser.useQuery({ gameToken }, { enabled: getGameQuery.isSuccess });
  const addUserMutation = api.example.addUserToken.useMutation();
  const startGameMutation = api.example.startGame.useMutation();
  const stopGameMutation = api.example.stopGame.useMutation();

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
        {getGameQuery.isSuccess && (
          <>
            <div className="my-8 ml-2 flex items-center space-x-2">
              <div>Admin status:</div>
              <ConnectionDot isConnected={isConnected} />
            </div>

            <ul className="space-y-4">
              {allUserQuery.data?.length === 0 && <>No user created yet</>}
              {allUserQuery.data?.map((user) => (
                <li key={user.id} className="flex items-center space-x-4 rounded border border-gray-300 p-2">
                  <HiddenQrCode
                    data={`${getOrigin()}/game/${gameToken}/${user.userToken}`}
                    width={200}
                    height={200}
                  />
                  <Link href={`/game/${gameToken}/${user.userToken}`} target="_blank">
                    Open user
                    <IconExternalLink className="ml-2 inline-block h-5 w-5 text-gray-600" />
                  </Link>

                  <div className="w-[200px] pl-8">{user.userName !== "" ? user.userName : "No-name"}</div>

                  <ConnectionDot isConnected={memberStore.isConnected(user.userToken)} />
                </li>
              ))}
            </ul>

            <button
              className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
              onClick={async () => {
                await addUserMutation.mutateAsync({ gameToken, userToken: generateRandomToken() });
                await allUserQuery.refetch();
              }}
            >
              Generate user QR code
            </button>

            {getGameQuery.data?.startedAt == null && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  await startGameMutation.mutateAsync({ gameToken });
                  await getGameQuery.refetch();
                }}
              >
                Start game
              </button>
            )}

            {getGameQuery.data?.startedAt != null && getGameQuery.data?.stoppedAt != null && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  await startGameMutation.mutateAsync({ gameToken });
                  await getGameQuery.refetch();
                }}
              >
                Restart game
              </button>
            )}

            {getGameQuery.data?.startedAt != null && getGameQuery.data?.stoppedAt == null && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  await stopGameMutation.mutateAsync({ gameToken });
                  await getGameQuery.refetch();
                }}
              >
                Stop game
              </button>
            )}
          </>
        )}
        {getGameQuery.isError && <>There is an error with this game token</>}
      </main>
    </>
  );
};

export default Game;

function HiddenQrCode({
  data,
  width = 100,
  height = 100,
}: {
  data: string;
  width?: number;
  height?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="cursor-pointer select-none" onClick={() => setVisible((prev) => !prev)}>
      {visible && <QrCodeImage data={data} width={width} height={height} />}
      {!visible && <IconQrcode className="h-10 w-10 bg-gray-200 text-gray-400 hover:text-gray-500" />}
    </div>
  );
}
