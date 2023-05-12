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
            <div className="flex items-center space-x-2">
              <div>Admin állapota:</div>
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
  const resetGameMutation = api.example.resetGame.useMutation();
  const finalizeGameMutation = api.example.finalizeGame.useMutation();
  const pauseGameMutation = api.example.pauseGame.useMutation();
  const resumeGameMutation = api.example.resumeGame.useMutation();

  const scoreInputQuery = api.example.getScoreInput.useQuery({ gameToken });

  const getGameQuery = api.example.getGame.useQuery({ gameToken });

  return (
    <>
      {getGameQuery.isSuccess && (
        <div>
          <h2 className="flex items-center gap-2 text-xl">
            Játék állapota:
            {getGameQuery.data.status === "new" && <div className="rounded bg-yellow-500 px-2 py-1">Előkészítés alatt</div>}
            {getGameQuery.data.status === "started" && <div className="rounded bg-green-500 px-2 py-1">Folyamatban</div>}
            {getGameQuery.data.status === "paused" && <div className="rounded bg-gray-400 px-2 py-1">Szüneteltetve</div>}
            {getGameQuery.data.status === "finished" && <div className="rounded bg-purple-500 px-2 py-1">Véglegesítve</div>}
          </h2>
          <div className="flex items-center">
            {getGameQuery.data.status === "new" && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  await startGameMutation.mutateAsync({ gameToken });
                  await getGameQuery.refetch();
                  await scoreInputQuery.refetch();
                }}
              >
                Indítás
              </button>
            )}

            {getGameQuery.data.status === "started" && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  await pauseGameMutation.mutateAsync({ gameToken });
                  await getGameQuery.refetch();
                  await scoreInputQuery.refetch();
                }}
              >
                Szünet
              </button>
            )}

            {getGameQuery.data.status === "paused" && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  if (confirm("Újra szeretnéd indítani a játékot? Az összes eddigi pontszám törlődik!")) {
                    await resetGameMutation.mutateAsync({ gameToken });
                    await getGameQuery.refetch();
                    await scoreInputQuery.refetch();
                  }
                }}
              >
                Újraindítás
              </button>
            )}

            {getGameQuery.data.status === "paused" && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  await resumeGameMutation.mutateAsync({ gameToken });
                  await getGameQuery.refetch();
                  await scoreInputQuery.refetch();
                }}
              >
                Folytatás
              </button>
            )}

            {getGameQuery.data.status === "paused" && (
              <button
                className="mt-4 rounded border border-gray-200 bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 active:bg-blue-700"
                onClick={async () => {
                  if (confirm("Le akarod zárni a játékot? Utána többet már nem lehet elindítani!")) {
                    await finalizeGameMutation.mutateAsync({ gameToken });
                    await getGameQuery.refetch();
                    await scoreInputQuery.refetch();
                  }
                }}
              >
                Lezárás
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Game;
