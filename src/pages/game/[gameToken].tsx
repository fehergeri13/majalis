import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { usePusher } from "~/utils/pusher";
import { ConnectionDot } from "~/components/ConnectionDot";
import { TeamAdmin } from "~/components/teams/TeamAdmin";
import { BaseAdmin } from "~/components/users/BaseAdmin";
import { SimpleScore } from "~/components/score/SimpleScore";

const Game: NextPage = () => {
  const router = useRouter();
  const gameToken = router.query.gameToken as string;
  const getGameQuery = api.example.getGame.useQuery({ gameToken }, { enabled: gameToken != null });

  const startGameMutation = api.example.startGame.useMutation();
  const stopGameMutation = api.example.stopGame.useMutation();

  const { pusher, isConnected } = usePusher({ type: "admin", authToken: gameToken, autoConnect: true });

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4">
        <div className="my-8 ml-2 flex items-center space-x-2">
          <div>Admin status:</div>
          <ConnectionDot isConnected={isConnected} />
        </div>

        {getGameQuery.isSuccess && <BaseAdmin gameToken={gameToken} pusher={pusher} />}

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

        {getGameQuery.isSuccess && <TeamAdmin gameToken={gameToken} />}
        {getGameQuery.isSuccess && <SimpleScore gameToken={gameToken} />}

        {getGameQuery.isError && <>There is an error with this game token</>}
      </main>
    </>
  );
};

export default Game;
