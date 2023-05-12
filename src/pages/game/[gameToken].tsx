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

  const { pusher, isConnected } = usePusher({ type: "admin", authToken: gameToken, autoConnect: true });

  return (
    <>
      <Head>
        <title>Majalis app</title>
        <meta name="description" content="Majalis app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4">
        {getGameQuery.isError && <>There is an error with this game token</>}
        {getGameQuery.isLoading && <>Loading game</>}
        {getGameQuery.isSuccess && (
          <div className="flex flex-col gap-2">
            <div className="my-8 ml-2 flex items-center space-x-2">
              <div>Admin status:</div>
              <ConnectionDot isConnected={isConnected} />
            </div>
            <StartStopGame gameToken={gameToken} />
            <BaseAdmin gameToken={gameToken} pusher={pusher} />
            <TeamAdmin gameToken={gameToken} />
            <SimpleScore gameToken={gameToken} pusher={pusher} />
          </div>
        )}
      </main>
    </>
  );
};

export function StartStopGame({ gameToken }: { gameToken: string }) {
  const startGameMutation = api.example.startGame.useMutation();
  const stopGameMutation = api.example.stopGame.useMutation();
  const getGameQuery = api.example.getGame.useQuery({ gameToken });

  return (
    <>
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
  );
}

export default Game;
